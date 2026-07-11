"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HubConnectionBuilder, HubConnection, LogLevel } from "@microsoft/signalr";
import Cookies from "js-cookie";
import { CircleNotch, Clock, ForkKnife, CheckCircle, WarningCircle, CookingPot, X, Phone, MapPin, Receipt, CaretDown } from "@phosphor-icons/react";

type OrderStatus = 0 | 1 | 2 | 3 | 4; // Pending, Preparing, Ready, Completed, Cancelled
type DiningMode = 0 | 1 | 2; // DineIn, TakeAway, Delivery

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note?: string | null;
  childItems: OrderItem[];
}

interface Order {
  id: number;
  status: OrderStatus;
  diningMode: DiningMode;
  tableNumber: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  note: string | null;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const OrderItemRow = ({ item }: { item: OrderItem }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.childItems && item.childItems.length > 0;
  
  return (
    <li className="text-sm text-slate-800">
      <div className="flex justify-between items-start gap-2">
        <div className="font-bold flex-1 leading-tight">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{item.quantity}x {item.name}</span>
            {hasChildren && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="flex items-center gap-1 text-[12px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md shrink-0 hover:bg-amber-100 transition-colors"
              >
                {isExpanded ? "Đóng" : `+${item.childItems.length} món phụ`}
                <CaretDown size={12} weight="bold" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
          {item.note && (
            <div className="text-xs font-normal text-amber-600 italic mt-0.5">
              Ghi chú: {item.note}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold text-emerald-700">{item.lineTotal.toLocaleString('vi-VN')}đ</div>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.ul 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-4 mt-2 space-y-1.5 border-l-2 border-slate-200 pl-3 overflow-hidden"
          >
            {item.childItems.map((child, cIdx) => (
              <li key={cIdx} className="flex justify-between items-start gap-2 text-[13px] text-slate-600 font-medium">
                <span>+ {child.quantity}x {child.name}</span>
                <span className="shrink-0">{child.lineTotal.toLocaleString('vi-VN')}đ</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
};

export function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Column Toggle State (Accordion)
  const [openColumns, setOpenColumns] = useState({
    pending: true,
    preparing: true,
    ready: false // Mặc định ẩn cột Đã xong để tiết kiệm diện tích trên mobile
  });

  const toggleColumn = (col: 'pending' | 'preparing' | 'ready') => {
    setOpenColumns(p => ({ ...p, [col]: !p[col] }));
  };

  // Modal State
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5130";

  const getToken = () => Cookies.get("anhhai_access_token") || "";

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");
      const data = await res.json();
      setOrders(data?.value || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    let isMounted = true;
    fetchOrders();

    const conn = new HubConnectionBuilder()
      .withUrl(`${apiUrl}/hubs/kitchen`, {
        accessTokenFactory: () => getToken(),
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => {
        if (!isMounted) {
          conn.stop();
          return;
        }
        console.log("Connected to KitchenHub");
        
        conn.on("OrderCreated", (newOrder: Order) => {
          setOrders((prev) => {
            if (prev.find(o => o.id === newOrder.id)) return prev;
            try {
              const audio = new Audio('/ting.mp3');
              audio.play().catch(() => {});
            } catch(e) {}
            // Push to END of array (append) to maintain Oldest First sorting
            return [...prev, newOrder];
          });
        });

        conn.on("OrderStatusChanged", (update: { orderId: number, status: string | number }) => {
          let newStatus: OrderStatus;
          if (typeof update.status === 'string') {
             if (!isNaN(parseInt(update.status, 10))) {
                 newStatus = parseInt(update.status, 10) as OrderStatus;
             } else {
                 const statusMap: Record<string, OrderStatus> = {
                     "Pending": 0,
                     "Preparing": 1,
                     "Ready": 2,
                     "Completed": 3,
                     "Cancelled": 4
                 };
                 newStatus = statusMap[update.status] ?? 0;
             }
          } else {
             newStatus = update.status as OrderStatus;
          }

          setOrders((prev) => 
            prev.map(o => o.id === update.orderId ? { ...o, status: newStatus } : o)
          );
        });

      })
      .catch((err) => {
        if (isMounted) {
          console.error("SignalR Connection Error: ", err);
          setError("Mất kết nối thời gian thực. Đang thử lại...");
        }
      });

    setConnection(conn);

    return () => {
      isMounted = false;
      conn.stop();
    };
  }, [apiUrl, fetchOrders]);

  // Fetch Order Detail when modal opens
  useEffect(() => {
    if (selectedOrderId === null) {
      setOrderDetail(null);
      return;
    }
    const fetchDetail = async () => {
      try {
        setDetailLoading(true);
        const res = await fetch(`${apiUrl}/api/orders/${selectedOrderId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("Không thể tải chi tiết đơn");
        const data = await res.json();
        setOrderDetail(data.value || data);
      } catch (err) {
        console.error(err);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [selectedOrderId, apiUrl]);

  const updateStatus = async (orderId: number, newStatus: OrderStatus, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProcessingId(orderId);
    try {
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ newStatus }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (orderDetail?.id === orderId) {
        setOrderDetail((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const renderCard = (order: Order) => {
    const isPending = order.status === 0;
    const isPreparing = order.status === 1;
    const isReady = order.status === 2;

    const timeSince = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
    const timeColor = timeSince > 15 ? "text-red-500" : timeSince > 10 ? "text-amber-500" : "text-slate-500";

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        key={order.id}
        onClick={() => setSelectedOrderId(order.id)}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 flex flex-col gap-3 relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isPending ? 'bg-amber-500' : isPreparing ? 'bg-blue-500' : 'bg-emerald-500'}`} />

        <div className="flex justify-between items-center pl-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              #{order.id}
            </span>
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${
              order.diningMode === 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {order.diningMode === 0 ? `Bàn ${order.tableNumber}` : 'Mang về'}
            </span>
            <div className={`flex items-center gap-1 text-xs font-bold ml-auto ${timeColor}`}>
              <Clock size={14} weight="bold" />
              {timeSince} phút
            </div>
          </div>
        </div>

        {order.note && (
          <div className="bg-amber-50 text-amber-900 text-[13px] font-medium p-2.5 rounded-xl border border-amber-100 flex gap-2 items-start pl-2 ml-2">
            <WarningCircle size={16} className="shrink-0 mt-0.5 text-amber-600" weight="fill" />
            <p className="line-clamp-2 leading-tight">{order.note}</p>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 ml-2">
          <ul className="space-y-3">
            {order.items.map((item, idx) => (
              <OrderItemRow key={idx} item={item} />
            ))}
          </ul>
          <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between items-center text-sm">
            <span className="font-semibold text-slate-600">Tổng cộng:</span>
            <span className="font-bold text-emerald-700 text-base">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
          </div>
        </div>

        <div className="mt-auto pt-1 pl-2">
          {isPending && (
            <button
              onClick={(e) => updateStatus(order.id, 1, e)}
              disabled={processingId === order.id}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {processingId === order.id ? <CircleNotch size={16} className="animate-spin" /> : <CookingPot size={16} weight="fill" />}
              Bắt đầu nấu
            </button>
          )}
          {isPreparing && (
            <button
              onClick={(e) => updateStatus(order.id, 2, e)}
              disabled={processingId === order.id}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {processingId === order.id ? <CircleNotch size={16} className="animate-spin" /> : <CheckCircle size={16} weight="fill" />}
              Đã nấu xong
            </button>
          )}
          {isReady && (
            <div className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-bold py-2.5 rounded-xl border border-emerald-200 text-sm">
              <CheckCircle size={16} weight="fill" />
              Sẵn sàng
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const pendingOrders = orders.filter(o => o.status === 0);
  const preparingOrders = orders.filter(o => o.status === 1);
  const readyOrders = orders.filter(o => o.status === 2);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <CircleNotch size={32} className="animate-spin text-amber-500" weight="bold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 font-sans pb-24">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 sticky top-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md shadow-amber-500/20">
              AH
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Màn hình Bếp</h1>
              <p className="text-[13px] font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live: SignalR Connected
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900">{pendingOrders.length + preparingOrders.length}</div>
            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Đơn đang chờ</div>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl font-medium flex items-center gap-2 border border-red-100">
            <WarningCircle size={20} weight="fill" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1: Pending */}
          <div className="bg-slate-200/50 rounded-3xl p-4 lg:min-h-[70vh] border border-slate-200 border-dashed flex flex-col gap-4 transition-all">
            <button 
              onClick={() => toggleColumn('pending')}
              className="flex items-center justify-between px-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shadow-inner shadow-amber-200/50">
                  {pendingOrders.length}
                </div>
                <h2 className="text-lg font-bold text-slate-800">Mới nhận</h2>
              </div>
              <CaretDown size={20} weight="bold" className={`text-slate-400 transition-transform ${openColumns.pending ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openColumns.pending && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    {pendingOrders.map(renderCard)}
                  </AnimatePresence>
                  {pendingOrders.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-medium text-sm border-2 border-dashed border-slate-300 rounded-2xl">
                      Không có đơn mới
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Column 2: Preparing */}
          <div className="bg-slate-200/50 rounded-3xl p-4 lg:min-h-[70vh] border border-slate-200 border-dashed flex flex-col gap-4 transition-all">
            <button 
              onClick={() => toggleColumn('preparing')}
              className="flex items-center justify-between px-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-inner shadow-blue-200/50">
                  {preparingOrders.length}
                </div>
                <h2 className="text-lg font-bold text-slate-800">Đang nấu</h2>
              </div>
              <CaretDown size={20} weight="bold" className={`text-slate-400 transition-transform ${openColumns.preparing ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openColumns.preparing && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    {preparingOrders.map(renderCard)}
                  </AnimatePresence>
                  {preparingOrders.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-medium text-sm border-2 border-dashed border-slate-300 rounded-2xl">
                      Bếp đang rảnh
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Column 3: Ready */}
          <div className="bg-slate-200/50 rounded-3xl p-4 lg:min-h-[70vh] border border-slate-200 border-dashed flex flex-col gap-4 transition-all">
            <button 
              onClick={() => toggleColumn('ready')}
              className="flex items-center justify-between px-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-inner shadow-emerald-200/50">
                  {readyOrders.length}
                </div>
                <h2 className="text-lg font-bold text-slate-800">Đã xong</h2>
              </div>
              <CaretDown size={20} weight="bold" className={`text-slate-400 transition-transform ${openColumns.ready ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openColumns.ready && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-4 overflow-hidden"
                >
                  <AnimatePresence mode="popLayout">
                    {readyOrders.map(renderCard)}
                  </AnimatePresence>
                  {readyOrders.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-medium text-sm border-2 border-dashed border-slate-300 rounded-2xl">
                      Chưa có món hoàn thành
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedOrderId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    Chi tiết Đơn #{selectedOrderId}
                    {orderDetail && (
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                        orderDetail.status === 0 ? 'bg-amber-100 text-amber-800' : orderDetail.status === 1 ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {orderDetail.status === 0 ? 'Mới nhận' : orderDetail.status === 1 ? 'Đang nấu' : 'Nấu xong'}
                      </span>
                    )}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {detailLoading || !orderDetail ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <CircleNotch size={32} className="animate-spin text-amber-500" weight="bold" />
                    <p className="text-sm font-medium text-slate-500">Đang tải thông tin đơn hàng...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-2">
                          <Receipt size={18} />
                          Loại đơn
                        </div>
                        <p className="text-slate-900 font-semibold">
                          {orderDetail.diningMode === 0 ? `Bàn ${orderDetail.tableNumber}` : orderDetail.diningMode === 1 ? 'Mang về' : 'Giao hàng'}
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-2">
                          <Clock size={18} />
                          Giờ đặt
                        </div>
                        <p className="text-slate-900 font-semibold">
                          {new Date(orderDetail.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          <span className="text-slate-400 font-normal ml-2">
                            {new Date(orderDetail.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </p>
                      </div>

                      {(orderDetail.customerPhone || orderDetail.deliveryAddress) && (
                        <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                          {orderDetail.customerPhone && (
                            <div>
                              <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-1">
                                <Phone size={18} /> Số điện thoại
                              </div>
                              <p className="text-slate-900 font-semibold">{orderDetail.customerPhone}</p>
                            </div>
                          )}
                          {orderDetail.deliveryAddress && (
                            <div>
                              <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-1">
                                <MapPin size={18} /> Địa chỉ giao
                              </div>
                              <p className="text-slate-900 font-semibold">{orderDetail.deliveryAddress}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {orderDetail.note && (
                      <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                        <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                          <WarningCircle size={20} weight="fill" />
                          Ghi chú của khách
                        </h4>
                        <p className="text-amber-900 font-medium">{orderDetail.note}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ForkKnife size={20} weight="bold" className="text-slate-400" />
                        Danh sách món ăn
                      </h4>
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        {orderDetail.items.map((item, idx) => (
                          <div key={idx} className={`${idx !== 0 ? 'border-t border-slate-100' : ''} p-4`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                                  {item.quantity}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block mt-1">{item.name}</span>
                                  {item.note && (
                                    <div className="text-sm font-medium text-amber-600 italic mt-1">
                                      Ghi chú: {item.note}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right font-bold text-emerald-700 shrink-0 mt-1">
                                {item.lineTotal.toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                            
                            {item.childItems && item.childItems.length > 0 && (
                              <div className="ml-11 mt-3 space-y-2">
                                {item.childItems.map((child, cIdx) => (
                                  <div key={cIdx} className="flex items-center justify-between text-sm text-slate-600 font-medium bg-slate-50 py-1.5 px-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400">+</span>
                                      <span className="font-bold">{child.quantity}</span>
                                      {child.name}
                                    </div>
                                    <span className="font-bold">{child.lineTotal.toLocaleString('vi-VN')}đ</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                          <span className="font-bold text-slate-700 text-lg">Tổng cộng</span>
                          <span className="font-black text-emerald-700 text-xl">{orderDetail.totalAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              {orderDetail && orderDetail.status < 2 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  {orderDetail.status === 0 ? (
                    <button
                      onClick={(e) => updateStatus(orderDetail.id, 1, e)}
                      disabled={processingId === orderDetail.id}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 text-base shadow-lg shadow-amber-500/25"
                    >
                      {processingId === orderDetail.id ? <CircleNotch size={20} className="animate-spin" /> : <CookingPot size={20} weight="fill" />}
                      Bắt đầu nấu đơn này
                    </button>
                  ) : (
                    <button
                      onClick={(e) => updateStatus(orderDetail.id, 2, e)}
                      disabled={processingId === orderDetail.id}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50 text-base shadow-lg shadow-blue-600/25"
                    >
                      {processingId === orderDetail.id ? <CircleNotch size={20} className="animate-spin" /> : <CheckCircle size={20} weight="fill" />}
                      Xác nhận nấu xong
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
