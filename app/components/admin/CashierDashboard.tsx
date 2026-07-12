"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Cookies from "js-cookie";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import {
  CircleNotch, WarningCircle, CheckCircle, X, Receipt,
  CalendarBlank, CreditCard, Armchair, Package,
  ArrowCounterClockwise, MapPin, Phone, Clock, MagnifyingGlass, Check, CaretDown
} from "@phosphor-icons/react";
import { AdminNav } from "./AdminNav";

// ── Types ────────────────────────────────────────────────────────────────────
type OrderStatus = 0 | 1 | 2 | 3 | 4;
type PaymentStatus = 0 | 1 | 2;
type DiningMode = 0 | 1 | 2;

interface OrderItem {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note: string | null;
  childItems: OrderItem[];
}

interface Order {
  id: number;
  trackingToken: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  channel: number;
  diningMode: DiningMode;
  tableNumber: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  note: string | null;
  subtotalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

type TableStatus = "empty" | "occupied" | "allPaid";

interface TableInfo {
  number: string;
  status: TableStatus;
  unpaidCount: number;
  totalOrders: number;
}

// ── Constants ────────────────────────────────────────────────────────────────
const TOTAL_TABLES = 20;

const statusLabel: Record<OrderStatus, string> = {
  0: "Chờ xử lý", 1: "Đang nấu", 2: "Sẵn sàng", 3: "Hoàn tất", 4: "Đã hủy"
};
const statusColor: Record<OrderStatus, string> = {
  0: "bg-amber-100 text-amber-800",
  1: "bg-blue-100 text-blue-800",
  2: "bg-emerald-100 text-emerald-800",
  3: "bg-slate-100 text-slate-600",
  4: "bg-red-100 text-red-700",
};
const paymentLabel: Record<PaymentStatus, string> = {
  0: "Chưa thanh toán", 1: "Đã thanh toán", 2: "Đã hoàn tiền"
};
const paymentBadge: Record<PaymentStatus, string> = {
  0: "bg-red-50 text-red-700 border-red-200",
  1: "bg-emerald-50 text-emerald-700 border-emerald-200",
  2: "bg-purple-50 text-purple-700 border-purple-200",
};
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

// ═══════════════════════════════════════════════════════════════════════════════
// ── Component ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export function CashierDashboard() {
  // ── State ────────────────────────────────────────────────────────────────
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  // Table detail
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableOrders, setTableOrders] = useState<Order[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tablePaymentFilter, setTablePaymentFilter] = useState<boolean | null>(null); // null=all, false=unpaid, true=paid

  // Takeaway/Delivery view
  const [activeTab, setActiveTab] = useState<"tables" | "takeaway">("tables");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [processingBulk, setProcessingBulk] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5130";
  const getToken = () => Cookies.get("anhhai_access_token") || "";

  // ── Fetch all orders (for table map status) ──────────────────────────────
  const fetchAllOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/orders?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
      const data = await res.json();
      setAllOrders(data?.value || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  // ── Fetch orders for a specific table ────────────────────────────────────
  const fetchTableOrders = useCallback(async (tableNum: string, isPaid?: boolean | null) => {
    try {
      setLoadingTable(true);
      setSelectedTable(tableNum);
      let url = `${apiUrl}/api/orders/table/${tableNum}?date=${selectedDate}`;
      if (isPaid === true) url += `&isPaid=true`;
      if (isPaid === false) url += `&isPaid=false`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Không thể tải đơn hàng của bàn");
      const data = await res.json();
      setTableOrders(data?.value || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTable(false);
    }
  }, [apiUrl, selectedDate]);

  // ── SignalR Auto Refresh ────────────────────────────────────────────────
  const selectedTableRef = useRef(selectedTable);
  const tablePaymentFilterRef = useRef(tablePaymentFilter);
  
  useEffect(() => { selectedTableRef.current = selectedTable; }, [selectedTable]);
  useEffect(() => { tablePaymentFilterRef.current = tablePaymentFilter; }, [tablePaymentFilter]);

  // Clear selections when table changes
  useEffect(() => {
    setSelectedOrderIds(new Set());
  }, [selectedTable]);

  useEffect(() => {
    let isMounted = true;
    const conn = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/kitchen`, {
        accessTokenFactory: () => getToken(),
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    const handleRefresh = () => {
      fetchAllOrders();
      const currentTable = selectedTableRef.current;
      if (currentTable && !currentTable.startsWith("takeaway")) {
        fetchTableOrders(currentTable, tablePaymentFilterRef.current);
      }
    };

    conn.start()
      .then(() => {
        if (!isMounted) return conn.stop();
        conn.on("OrderCreated", () => {
          try {
            const audio = new Audio('/ting.mp3');
            audio.play().catch(() => {});
          } catch(e) {}
          handleRefresh();
        });
        conn.on("OrderStatusChanged", handleRefresh);
        conn.on("PaymentStatusChanged", handleRefresh);
      })
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      isMounted = false;
      conn.stop();
    };
  }, [apiUrl, fetchAllOrders, fetchTableOrders]);

  // Re-fetch when payment filter changes
  const handleTablePaymentFilter = (filter: boolean | null) => {
    setTablePaymentFilter(filter);
    if (selectedTable && !selectedTable.startsWith("takeaway")) {
      fetchTableOrders(selectedTable, filter);
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const payAllOrders = async (orders: Order[]) => {
    try {
      setProcessingBulk(true);
      await Promise.all(
        orders.map(o =>
          fetch(`${apiUrl}/api/orders/${o.id}/payment`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ newStatus: 1 }),
          })
        )
      );
      // Refresh both views
      await fetchAllOrders();
      if (selectedTableRef.current && !selectedTableRef.current.startsWith("takeaway")) {
        fetchTableOrders(selectedTableRef.current, tablePaymentFilterRef.current);
      }
    } catch (err: any) {
      alert("Có lỗi xảy ra khi thanh toán: " + err.message);
    } finally {
      setProcessingBulk(false);
      setSelectedOrderIds(new Set());
    }
  };

  const updatePayment = async (orderId: number, newStatus: PaymentStatus) => {
    try {
      setProcessingId(orderId);
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      if (!res.ok) throw new Error("Cập nhật thanh toán thất bại");
      // Refresh both views
      await fetchAllOrders();
      if (selectedTable && !selectedTable.startsWith("takeaway")) await fetchTableOrders(selectedTable, tablePaymentFilter);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const completeOrder = async (orderId: number) => {
    try {
      setProcessingId(orderId);
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ newStatus: 3 }),
      });
      if (!res.ok) throw new Error("Hoàn tất đơn thất bại");
      await fetchAllOrders();
      if (selectedTable && !selectedTable.startsWith("takeaway")) await fetchTableOrders(selectedTable, tablePaymentFilter);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // ── Derived: Build table map ─────────────────────────────────────────────
  const dineInOrders = allOrders.filter(
    o => o.diningMode === 0 && o.status !== 4
  );
  const takeawayOrders = allOrders.filter(
    o => (o.diningMode === 1 || o.diningMode === 2) && o.status !== 4
  );

  const tableMap: TableInfo[] = Array.from({ length: TOTAL_TABLES }, (_, i) => {
    const num = String(i + 1);
    const tableOrds = dineInOrders.filter(o => o.tableNumber === num);
    const unpaid = tableOrds.filter(o => o.paymentStatus === 0);

    let status: TableStatus = "empty";
    if (tableOrds.length > 0) {
      status = unpaid.length > 0 ? "occupied" : "allPaid";
    }

    return { number: num, status, unpaidCount: unpaid.length, totalOrders: tableOrds.length };
  });

  // Stats (no revenue — staff-safe)
  const totalOrders = allOrders.filter(o => o.status !== 4).length;
  const unpaidTotal = allOrders.filter(o => o.paymentStatus === 0 && o.status !== 4).length;
  const paidTotal = allOrders.filter(o => o.paymentStatus === 1 && o.status !== 4).length;

  // Table detail bulk payment
  const unpaidTableOrders = tableOrders.filter(o => o.paymentStatus === 0 && o.status !== 4);
  const selectedUnpaidOrders = unpaidTableOrders.filter(o => selectedOrderIds.has(o.id));
  const unpaidTableTotal = selectedUnpaidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading && allOrders.length === 0) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: "#FAFAF9" }}>
        <CircleNotch size={32} className="animate-spin" style={{ color: "#F59E0B" }} weight="bold" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] font-[var(--font-jakarta)]" style={{ background: "#FAFAF9" }}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">

        {/* ═══ Header ═══════════════════════════════════════════════════════ */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-5 rounded-2xl border border-slate-200/40 sticky top-4 z-10"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <AdminNav />
            <div>
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: "#0F172A" }}>
                Thu ngân
              </h1>
              <p className="text-[13px] font-medium" style={{ color: "#475569" }}>
                Sơ đồ bàn & thanh toán
              </p>
            </div>
          </div>

          {/* Stats — only counts, no revenue */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>
                Tổng đơn
              </div>
              <div className="text-xl font-extrabold" style={{ color: "#0F172A" }}>{totalOrders}</div>
            </div>
            <div className="w-px h-10" style={{ background: "#E2E8F0" }} />
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>
                Chưa TT
              </div>
              <div className="text-xl font-extrabold" style={{ color: "#EF4444" }}>{unpaidTotal}</div>
            </div>
            <div className="w-px h-10" style={{ background: "#E2E8F0" }} />
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#94A3B8" }}>
                Đã TT
              </div>
              <div className="text-xl font-extrabold" style={{ color: "#10B981" }}>{paidTotal}</div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 p-4 rounded-2xl font-medium flex items-center gap-2 border"
            style={{ background: "#FEF2F2", color: "#EF4444", borderColor: "#FECACA" }}
          >
            <WarningCircle size={20} weight="fill" /> {error}
          </div>
        )}

        {/* ═══ Date + Tab Toggle ═════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5"
            style={{ borderColor: "#E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <CalendarBlank size={18} style={{ color: "#94A3B8" }} />
            <input
              type="date"
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setSelectedTable(null); }}
              className="bg-transparent border-none outline-none text-sm font-bold"
              style={{ color: "#0F172A" }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("tables"); setSelectedTable(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={activeTab === "tables"
                ? { background: "#0F172A", color: "#fff" }
                : { background: "#fff", color: "#475569", border: "1px solid #E2E8F0" }
              }
            >
              <Armchair size={16} weight={activeTab === "tables" ? "fill" : "regular"} />
              Sơ đồ bàn
            </button>
            <button
              onClick={() => { setActiveTab("takeaway"); setSelectedTable(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              style={activeTab === "takeaway"
                ? { background: "#0F172A", color: "#fff" }
                : { background: "#fff", color: "#475569", border: "1px solid #E2E8F0" }
              }
            >
              <Package size={16} weight={activeTab === "takeaway" ? "fill" : "regular"} />
              Mang đi & Giao ({takeawayOrders.length})
            </button>
          </div>
        </div>

        {/* ═══ Main Content ══════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ─── Left: Table Map or Takeaway List ───────────────────────── */}
          <div className="flex-1">
            {activeTab === "tables" ? (
              /* ── Table Map Grid ─────────────────────────────────────── */
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {tableMap.map(table => {
                  const isSelected = selectedTable === table.number;
                  let bg = "#F1F5F9";   // empty: muted gray
                  let border = "#E2E8F0";
                  let textColor = "#94A3B8";
                  let subText = "Trống";

                  if (table.status === "occupied") {
                    bg = isSelected ? "#FEF3C7" : "#FFFBEB";
                    border = "#F59E0B";
                    textColor = "#92400E";
                    subText = `${table.unpaidCount} chưa TT`;
                  } else if (table.status === "allPaid") {
                    bg = isSelected ? "#D1FAE5" : "#ECFDF5";
                    border = "#10B981";
                    textColor = "#065F46";
                    subText = "Đã TT hết";
                  }

                  return (
                    <motion.button
                      key={table.number}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => fetchTableOrders(table.number)}
                      className="relative rounded-2xl p-4 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
                      style={{
                        background: bg,
                        border: `2px solid ${isSelected ? border : "transparent"}`,
                        boxShadow: isSelected ? `0 4px 20px ${border}40` : "0 1px 3px rgba(0,0,0,0.04)",
                        minHeight: "100px",
                      }}
                    >
                      <Armchair
                        size={28}
                        weight={table.status === "empty" ? "thin" : "fill"}
                        style={{ color: table.status === "empty" ? "#CBD5E1" : border }}
                      />
                      <span className="text-lg font-extrabold" style={{ color: textColor }}>
                        {table.number}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: textColor, opacity: 0.7 }}>
                        {subText}
                      </span>
                      {table.unpaidCount > 0 && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                          style={{ background: "#EF4444", color: "#fff" }}
                        >
                          {table.unpaidCount}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              /* ── Takeaway / Delivery Orders ────────────────────────── */
              <div className="bg-white rounded-2xl border overflow-hidden flex flex-col"
                style={{ borderColor: "#E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", height: "fit-content" }}
              >
                {/* Search Bar for Takeaway */}
                <div className="p-4 border-b" style={{ borderColor: "#F1F5F9" }}>
                  <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-3 py-2"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    <MagnifyingGlass size={18} style={{ color: "#94A3B8" }} />
                    <input
                      type="text"
                      placeholder="Tìm theo mã token hoặc mã đơn..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm w-full font-medium"
                      style={{ color: "#0F172A" }}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                        <X size={14} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>

                {(() => {
                  const filteredOrders = takeawayOrders.filter(o => 
                    o.trackingToken?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.id.toString().includes(searchQuery)
                  );

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="text-center py-20 font-medium" style={{ color: "#94A3B8" }}>
                        {searchQuery ? "Không tìm thấy đơn hàng nào." : "Không có đơn mang đi / giao hàng nào hôm nay."}
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y max-h-[60vh] overflow-y-auto" style={{ borderColor: "#F1F5F9" }}>
                      {filteredOrders.map(order => (
                      <button
                        key={order.id}
                        onClick={() => { setSelectedTable(`takeaway-${order.id}`); setTableOrders([order]); }}
                        className="w-full text-left p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: order.diningMode === 1 ? "#FEF3C7" : "#EDE9FE" }}
                        >
                          <Package size={20} weight="fill"
                            style={{ color: order.diningMode === 1 ? "#F59E0B" : "#8B5CF6" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-extrabold text-sm" style={{ color: "#0F172A" }}>
                              #{order.trackingToken?.slice(0, 8).toUpperCase() || order.id}
                            </span>
                            <span className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>
                              {fmtTime(order.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusColor[order.status]}`}>
                              {statusLabel[order.status]}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${paymentBadge[order.paymentStatus]}`}>
                              {paymentLabel[order.paymentStatus]}
                            </span>
                          </div>
                        </div>
                        <span className="font-extrabold text-sm" style={{ color: "#10B981" }}>
                          {fmt(order.totalAmount)}
                        </span>
                      </button>
                    ))}
                  </div>
                );
                })()}
              </div>
            )}
          </div>

          {/* ─── Desktop: Side Panel  |  Mobile: Bottom Sheet Modal ─── */}
          <AnimatePresence mode="wait">
            {selectedTable && (
              <>
                {/* Mobile: Full-screen bottom sheet overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setSelectedTable(null); setTableOrders([]); setTablePaymentFilter(null); }}
                  className="fixed inset-0 z-40 lg:hidden"
                  style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)" }}
                />
                <motion.div
                  key={selectedTable}
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  className="fixed inset-x-0 bottom-0 z-50 lg:relative lg:inset-auto lg:z-auto lg:w-[420px] lg:shrink-0"
                >
                  <div className="bg-white rounded-t-3xl lg:rounded-2xl border overflow-hidden lg:sticky lg:top-24"
                    style={{ borderColor: "#E2E8F0", boxShadow: "0 -4px 30px rgba(0,0,0,0.1)", maxHeight: "85vh" }}
                  >
                    {/* Drag handle (mobile) */}
                    <div className="flex justify-center pt-3 pb-1 lg:hidden">
                      <div className="w-10 h-1 rounded-full" style={{ background: "#CBD5E1" }} />
                    </div>

                    {/* Panel Header */}
                    <div className="p-5 border-b" style={{ borderColor: "#F1F5F9", background: "#FAFAF9" }}>
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-extrabold" style={{ color: "#0F172A" }}>
                          {selectedTable.startsWith("takeaway") && tableOrders.length > 0
                            ? `Đơn #${tableOrders[0].trackingToken?.slice(0, 8).toUpperCase() || tableOrders[0].id}`
                            : `Bàn ${selectedTable}`
                          }
                        </h2>
                        <button
                          onClick={() => { setSelectedTable(null); setTableOrders([]); setTablePaymentFilter(null); }}
                          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                          style={{ background: "#F1F5F9", color: "#94A3B8" }}
                        >
                          <X size={16} weight="bold" />
                        </button>
                      </div>

                      {/* Payment filter tabs (for table orders) */}
                      {!selectedTable.startsWith("takeaway") && (
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-2">
                            {([
                              { key: null as boolean | null, label: "Tất cả" },
                              { key: false as boolean | null, label: "Chưa TT" },
                              { key: true as boolean | null, label: "Đã TT" },
                            ]).map(tab => (
                              <button
                                key={String(tab.key)}
                                onClick={() => handleTablePaymentFilter(tab.key)}
                                className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
                                style={
                                  tablePaymentFilter === tab.key
                                    ? { background: "#0F172A", color: "#fff" }
                                    : { background: "#F1F5F9", color: "#475569" }
                                }
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                          
                          {/* Select All Checkbox */}
                          {unpaidTableOrders.length > 1 && (
                            <button
                              onClick={() => {
                                if (selectedOrderIds.size === unpaidTableOrders.length) {
                                  setSelectedOrderIds(new Set());
                                } else {
                                  setSelectedOrderIds(new Set(unpaidTableOrders.map(o => o.id)));
                                }
                              }}
                              className="text-[12px] font-bold flex items-center gap-1.5 transition-colors pr-1"
                              style={{ color: selectedOrderIds.size === unpaidTableOrders.length ? "#10B981" : "#64748B" }}
                            >
                              <div className="w-[18px] h-[18px] flex items-center justify-center rounded border transition-colors"
                                style={selectedOrderIds.size === unpaidTableOrders.length ? { background: "#10B981", borderColor: "#10B981" } : { borderColor: "#CBD5E1", background: "#fff" }}
                              >
                                {selectedOrderIds.size === unpaidTableOrders.length && <Check size={12} weight="bold" color="#fff" />}
                              </div>
                              <span className="hidden sm:inline">Chọn tất cả</span>
                              <span className="sm:hidden">Tất cả</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Loading */}
                    {loadingTable ? (
                      <div className="py-16 flex items-center justify-center">
                        <CircleNotch size={24} className="animate-spin" style={{ color: "#F59E0B" }} />
                      </div>
                    ) : tableOrders.length === 0 ? (
                      <div className="py-16 text-center font-medium" style={{ color: "#94A3B8" }}>
                        {tablePaymentFilter === false ? "Không có đơn chưa thanh toán." :
                         tablePaymentFilter === true ? "Không có đơn đã thanh toán." :
                         "Bàn này chưa có đơn hàng nào."}
                      </div>
                    ) : (
                      <div className="flex flex-col flex-1 overflow-hidden">
                        {/* Orders list */}
                        <div className="overflow-y-auto flex-1" style={{ maxHeight: unpaidTableOrders.length > 1 ? "calc(85vh - 230px)" : "calc(85vh - 140px)" }}>
                          {tableOrders.map(order => (
                          <div key={order.id} className="p-5 border-b" style={{ borderColor: "#F1F5F9" }}>
                            {/* Order header (Mobile optimized) */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-start gap-2.5">
                                {order.paymentStatus === 0 && order.status !== 4 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newSet = new Set(selectedOrderIds);
                                      if (newSet.has(order.id)) newSet.delete(order.id);
                                      else newSet.add(order.id);
                                      setSelectedOrderIds(newSet);
                                    }}
                                    className="w-[22px] h-[22px] flex items-center justify-center rounded border transition-colors shrink-0 mt-0.5"
                                    style={selectedOrderIds.has(order.id) ? { background: "#0F172A", borderColor: "#0F172A" } : { borderColor: "#CBD5E1", background: "#fff" }}
                                  >
                                    {selectedOrderIds.has(order.id) && <Check size={14} weight="bold" color="#fff" />}
                                  </button>
                                )}
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-sm leading-tight" style={{ color: "#0F172A" }}>
                                    #{order.trackingToken?.slice(0, 8).toUpperCase() || order.id}
                                  </span>
                                  <span className="flex items-center gap-1 text-[11px] font-medium mt-1" style={{ color: "#94A3B8" }}>
                                    <Clock size={12} /> {fmtTime(order.createdAt)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-[2px] rounded leading-tight ${statusColor[order.status]}`}>
                                  {statusLabel[order.status]}
                                </span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-[2px] rounded border leading-tight ${paymentBadge[order.paymentStatus]}`}>
                                  {paymentLabel[order.paymentStatus]}
                                </span>
                              </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-2 mb-3">
                              {order.items.map((item, i) => (
                                <div key={i}>
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black"
                                        style={{ background: "#F1F5F9", color: "#475569" }}
                                      >
                                        {item.quantity}
                                      </span>
                                      <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                                        {item.name}
                                      </span>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: "#475569" }}>
                                      {fmt(item.lineTotal)}
                                    </span>
                                  </div>
                                  {item.note && (
                                    <p className="text-[11px] ml-7 mt-0.5 font-medium" style={{ color: "#F59E0B" }}>
                                      📝 {item.note}
                                    </p>
                                  )}
                                  {item.childItems.length > 0 && (
                                    <details className="ml-7 mt-1.5 group outline-none">
                                      <summary className="text-[11px] font-medium cursor-pointer flex items-center justify-between outline-none py-1 select-none" style={{ color: "#94A3B8" }}>
                                        <span>{item.childItems.length} món phụ đính kèm</span>
                                        <CaretDown size={12} className="transition-transform group-open:rotate-180" />
                                      </summary>
                                      <div className="mt-1 space-y-1 border-l pl-2.5 pb-1" style={{ borderColor: "#E2E8F0" }}>
                                        {item.childItems.map((child, ci) => (
                                          <div key={ci} className="flex justify-between text-[11px]" style={{ color: "#64748B" }}>
                                            <span className="font-medium">+ {child.name} x{child.quantity}</span>
                                            <span className="font-medium">{fmt(child.lineTotal)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Order note */}
                            {order.note && (
                              <div className="p-2.5 rounded-xl mb-3 border"
                                style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}
                              >
                                <p className="text-[11px] font-semibold" style={{ color: "#92400E" }}>
                                  📝 Ghi chú: {order.note}
                                </p>
                              </div>
                            )}

                            {/* Order total */}
                            <div className="flex justify-between items-center py-2 border-t" style={{ borderColor: "#F1F5F9" }}>
                              <span className="text-sm font-bold" style={{ color: "#475569" }}>Tổng</span>
                              <span className="text-base font-extrabold" style={{ color: "#10B981" }}>
                                {fmt(order.totalAmount)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="mt-3 space-y-2">
                              {order.paymentStatus === 0 && order.status !== 4 && (
                                <button
                                  onClick={() => updatePayment(order.id, 1)}
                                  disabled={processingId === order.id}
                                  className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-full transition-all disabled:opacity-50 text-sm"
                                  style={{ background: "#F59E0B", color: "#fff", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}
                                >
                                  {processingId === order.id ? (
                                    <CircleNotch size={16} className="animate-spin" />
                                  ) : (
                                    <CreditCard size={16} weight="fill" />
                                  )}
                                  Xác nhận Thanh toán
                                </button>
                              )}

                              {order.paymentStatus === 1 && order.status === 2 && (
                                <button
                                  onClick={() => completeOrder(order.id)}
                                  disabled={processingId === order.id}
                                  className="w-full flex items-center justify-center gap-2 font-bold py-3 rounded-full transition-all disabled:opacity-50 text-sm"
                                  style={{ background: "#10B981", color: "#fff", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
                                >
                                  {processingId === order.id ? (
                                    <CircleNotch size={16} className="animate-spin" />
                                  ) : (
                                    <CheckCircle size={16} weight="fill" />
                                  )}
                                  Hoàn tất đơn
                                </button>
                              )}

                              {order.paymentStatus === 1 && order.status !== 4 && (
                                <button
                                  onClick={() => updatePayment(order.id, 2)}
                                  disabled={processingId === order.id}
                                  className="w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-full transition-all disabled:opacity-50 text-[13px] border"
                                  style={{ background: "#fff", color: "#475569", borderColor: "#E2E8F0" }}
                                >
                                  <ArrowCounterClockwise size={14} weight="bold" />
                                  Hoàn tiền
                                </button>
                              )}

                              {order.status === 3 && order.paymentStatus === 1 && (
                                <div className="w-full flex items-center justify-center gap-2 font-bold py-2.5 rounded-full text-[13px] border"
                                  style={{ background: "#ECFDF5", color: "#065F46", borderColor: "#A7F3D0" }}
                                >
                                  <CheckCircle size={16} weight="fill" />
                                  Đã hoàn tất
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Bulk Payment Footer */}
                      {selectedOrderIds.size > 0 && (
                        <div className="p-5 border-t bg-white shrink-0" style={{ borderColor: "#E2E8F0" }}>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[13px] font-bold text-slate-500">
                              Đã chọn {selectedOrderIds.size} đơn:
                            </span>
                            <span className="text-xl font-extrabold text-emerald-600">
                              {fmt(unpaidTableTotal)}
                            </span>
                          </div>
                          <button
                            onClick={() => payAllOrders(selectedUnpaidOrders)}
                            disabled={processingBulk}
                            className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-sm"
                            style={{ background: "#0F172A", color: "#fff", boxShadow: "0 4px 14px rgba(15,23,42,0.2)" }}
                          >
                            {processingBulk ? (
                              <CircleNotch size={18} className="animate-spin" />
                            ) : (
                              <CreditCard size={18} weight="fill" />
                            )}
                            Xác nhận Thanh toán ({selectedOrderIds.size})
                          </button>
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Desktop placeholder when no table selected */}
          {!selectedTable && (
            <div className="hidden lg:flex w-[420px] shrink-0 items-center justify-center">
              <div className="text-center py-20">
                <Receipt size={48} className="mx-auto mb-3" style={{ color: "#CBD5E1" }} />
                <p className="font-medium text-sm" style={{ color: "#94A3B8" }}>
                  Chọn một bàn để xem chi tiết đơn hàng
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
