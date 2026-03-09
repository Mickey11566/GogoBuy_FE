import { Router } from '@angular/router';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../@service/auth.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RouterLink } from '@angular/router';
import { Avatar, AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { catchError, forkJoin, map, of } from 'rxjs';
import { MessageService, NotifiMesReq, NotifiCategoryEnum } from '../@service/message.service';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TieredMenu } from 'primeng/tieredmenu';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { StoreService } from '../@service/store.service';
import { CartService } from '../@service/cart.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    RouterLink,
    AvatarModule,
    MenuModule,
    AvatarModule,
    MenuModule,
    BadgeModule,
    DialogModule,
    DatePickerModule,
    InputTextModule,
    TextareaModule,
    TieredMenu,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
  stores: any[] = [];
  events: any[] = [];
  users: any[] = [];
  complaints: any[] = [];
  loading = false;
  items: any[] | undefined;
  minDate: Date = new Date();


  currentView: 'announce' | 'stores' | 'events' | 'users' | 'complaints' = 'announce';

  menuItems = [
    { label: '公告通知管理', icon: 'pi pi-megaphone', id: 'announce' },
    { label: '店家管理', icon: 'pi pi-shop', id: 'stores' },
    { label: '團購活動', icon: 'pi pi-calendar', id: 'events' },
    { label: '會員管理', icon: 'pi pi-users', id: 'users' },
    { label: '申訴單處理', icon: 'pi pi-envelope', id: 'complaints' }
  ];

  // 公告相關變數
  displayAnnounceDialog = false;
  historyNotices: any[] = []; // 歷史公告列表
  announceData: Partial<NotifiMesReq> = {
    title: '',
    content: '',
    targetUrl: '',
    expiredAt: '',
    category: NotifiCategoryEnum.SYSTEM
  };
  announceDate: Date | null = null; // for Calendar binding

  // 管理中心關聯變數
  displayManageDialog = false;
  selectedEventForManage: any = null;
  manageMembersMap = signal<Record<number, any[]>>({});

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    public router: Router,
    private storeService: StoreService,
    private cart: CartService,
  ) { }

  ngOnInit() {

    this.items = [
      {
        label: '權限',
        icon: 'pi pi-user-edit',
        items: [
          {
            label: '升級為管理員',
            icon: 'pi pi-crown',
          },
          {
            label: '調整為一般用戶',
            icon: 'pi pi-user',
          },

        ]
      }];

    this.loadData();
    this.loadHistory(); // 載入歷史公告
  }

  setView(view: any) {
    this.currentView = view;
  }

  // 載入歷史公告
  loadHistory() {
    this.messageService.getGlobalNoticeHistory().subscribe({
      next: (data) => {
        // data 是 SystemNotice Array
        // content 可能是 JSON String，嘗試解析
        this.historyNotices = data.map((item: any) => {
          let parsedContent = item.content;
          let parsedTitle = '系統公告';
          let parsedLink = '';

          try {
            const obj = JSON.parse(item.content);
            if (obj && typeof obj == 'object') {
              parsedTitle = obj.title || '系統公告';
              parsedContent = obj.content || item.content;
              parsedLink = obj.link || '';
            }
          } catch (e) {
            // 不是 JSON，就直接顯示原始字串
          }

          return {
            ...item,
            displayTitle: parsedTitle,
            displayContent: parsedContent,
            displayLink: parsedLink
          };
        });
      },
      error: (err) => console.error('Load history failed', err)
    });
  }

  loadData() {
    this.loading = true;
    const defaultAvatar = '../default_avatar.png';

    forkJoin({
      stores: this.authService.getallstore().pipe(catchError((err) => { console.warn('Dashboard: Stores API failed', err); return of(null); })),
      events: this.authService.getallevent().pipe(catchError((err) => { console.warn('Dashboard: Events API failed', err); return of(null); })),
      users: this.authService.getAllUser().pipe(catchError((err) => { console.warn('Dashboard: Users API failed', err); return of(null); })),
      complaints: this.authService.getAllComplaints().pipe(catchError((err) => { console.warn('Dashboard: Complaints API failed', err); return of(null); }))
    }).subscribe({
      next: (res: any) => {
        // 1. 處理 Store 資料 (支援多種可能的欄位名)
        let stores: any[] = [];
        const rawStores = res.stores;
        if (Array.isArray(rawStores)) {
          stores = rawStores;
        } else if (rawStores) {
          stores = rawStores.storeList || rawStores.store_list || rawStores.stores || rawStores.data || [];
        }
        this.stores = stores;

        // 2. 處理 User 資料
        let users: any[] = [];
        const rawUsers = res.users;
        if (Array.isArray(rawUsers)) {
          users = rawUsers;
        } else if (rawUsers) {
          users = rawUsers.userList || rawUsers.user_list || rawUsers.users || rawUsers.data || [];
        }

        const processedUsers = users.map((u: any) => ({
          ...u,
          avatarUrl: u?.avatarUrl || u?.avatar_url || defaultAvatar
        }));
        this.users = processedUsers;

        // 3. 處理 Complaint 資料
        let complaints: any[] = [];
        const rawComplaints = res.complaints;
        if (Array.isArray(rawComplaints)) {
          complaints = rawComplaints;
        } else if (rawComplaints) {
          complaints = rawComplaints.complaintList || rawComplaints.complaint_list || rawComplaints.complaints || rawComplaints.data || [];
        }
        this.complaints = complaints;

        // 4. 處理 Event 資料 (依賴前面處理好的 processedUsers 與 stores)
        const avatarMap = new Map(processedUsers.map((u: any) => [u.id, u.avatarUrl]));
        const storeMap = new Map(stores.map((s: any) => [s.id, s.name]));

        let events: any[] = [];
        const rawEventsRes = res.events;
        if (Array.isArray(rawEventsRes)) {
          events = rawEventsRes;
        } else if (rawEventsRes) {
          events = rawEventsRes.groupsSearchViewList || rawEventsRes.groups_search_view_list ||
            rawEventsRes.groupbuyEvents || rawEventsRes.groupbuy_events ||
            rawEventsRes.eventList || rawEventsRes.event_list ||
            rawEventsRes.events || rawEventsRes.data || [];
        }

        this.events = events.map((event: any) => {
          if (!event) return null;
          return {
            ...event,
            id: event.id || event.eventId || event.event_id,
            status: event.status || event.eventStatus || event.event_status,
            avatarUrl: avatarMap.get(event.hostId || event.host_id) || defaultAvatar,
            storeName: storeMap.get(event.storeId || event.storesId || event.store_id || event.stores_id) || event.storeName || event.store_name || '未知店家'
          };
        }).filter(e => e !== null);

        this.loading = false;
      },
      error: (err) => {
        console.error('Dashboard: Critical data load failure', err);
        this.loading = false;
      }
    });
  }

  addStore() {
    this.storeService.clearCurrentStore();
    sessionStorage.removeItem('temp_order_info');
    this.router.navigate(['/management/store_upsert']);
  }

  getSeverity(status: string) {
    switch (status) {
      case 'GOOGLE': return 'info';
      default: return 'success';
    }
  }

  getUserStatusSeverity(status: string) {
    switch (status) {
      case 'banned': return 'danger';
      case 'pending_active': return 'info';
      case 'self_suspended': return 'warn';

      default: return 'success';
    }
  }

  getEventSeverity(status: string) {
    switch (status) {
      case 'FINISHED': return 'info';
      default: return 'success';
    }
  }

  storeGetServerity(category: string) {
    switch (category) {
      case 'fast': return 'info';
      default: return 'success';
    }
  }

  getPublishSeverity(publish: boolean) {
    return publish ? 'success' : 'secondary';
  }

  // 開啟公告視窗
  openAnnounceDialog() {
    this.displayAnnounceDialog = true;
    this.announceDate = null;
    this.announceData = {
      title: '',
      content: '',
      targetUrl: '',
      category: NotifiCategoryEnum.SYSTEM
    };
  }

  // 發送公告
  sendAnnouncement() {
    if (!this.announceData.title || !this.announceData.content) {
      Swal.fire('請填寫標題與內容', '', 'warning');
      return;
    }

    // 1. 處理日期 -> 轉成 backend 要求的 LocalDateTime 格式
    let timeStr: string | undefined = undefined;
    if (this.announceDate) {
      // 格式為: YYYY-MM-DDTHH:mm:ss
      const iso = this.announceDate.toISOString(); // e.g., 2023-10-27T10:00:00.000Z
      timeStr = iso.split('.')[0]; // 拿掉毫秒, 變成 2023-10-27T10:00:00
    }

    // 2. 組合 msg 內容並轉換成JSON格式內容以讓 SSE 收到後能解析成 title/content/link
    const payloadMsgObj = {
      title: this.announceData.title,
      content: this.announceData.content,
      link: this.announceData.targetUrl,
      createdAt: new Date().toLocaleString()
    };
    const msgString = JSON.stringify(payloadMsgObj);

    // 3. 呼叫 Service
    // 注意: setGlobalNotice 參數是 { content, expiredAt? }
    this.messageService.setGlobalNotice({
      content: msgString,
      expiredAt: timeStr
    }).subscribe({
      next: () => {
        // res 是純字串 (String return from Backend)
        Swal.fire({
          icon: "success",
          title: "公告發送成功!",
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        this.displayAnnounceDialog = false;
        this.loadHistory(); // 重新載入歷史
      },
      error: (err) => {
        Swal.fire('發送失敗', err, 'error');
      }
    });
  }

  // ==================== 管理操作功能 ====================

  /**
   * 刪除店家 (軟刪除)
   */
  onStoreDelete(store: any) {
    Swal.fire({
      title: '確定要刪除店家?',
      text: `店家名稱: ${store.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.softDeleteStore(store.id).subscribe({
          next: () => {
            Swal.fire('已刪除', '店家已標記為刪除狀態', 'success');
            this.loadData();
          },
          error: (err) => Swal.fire('刪除失敗', err?.message, 'error')
        });
      }
    });
  }

  /**
   * 強制結單 (活動)
   */
  onEventClose(event: any) {
    Swal.fire({
      title: '確定要強制結單?',
      text: `活動名稱: ${event.eventName}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定結單',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        // 需注意: 後端需 hostId，這裡假設可以是任意管理員操作，API內部可能校驗
        // 若 API 強制要求 hostId 必須是發起人，這裡可能會報錯
        // 暫時帶入 event.hostId 嘗試
        this.authService.forceCloseEvent(event.id, event.hostId).subscribe({
          next: () => {
            Swal.fire('結單成功', '該活動已結束', 'success');
            this.loadData();
          },
          error: (err) => Swal.fire('操作失敗', err?.message, 'error')
        });
      }
    });
  }

  /**
   * 刪除活動 (完全刪除)
   */
  onEventDelete(event: any) {
    Swal.fire({
      title: '確定要永久刪除此活動?',
      text: '此操作無法復原!',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: '永久刪除',
      cancelButtonText: '取消',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.deleteEventPhysically(event.id).subscribe({
          next: () => {
            Swal.fire('已刪除', '活動資料已移除', 'success');
            this.loadData();
          },
          error: (err) => Swal.fire('刪除失敗', err?.message, 'error')
        });
      }
    });
  }

  /**
   * 停權用戶
   */
  onUserBan(user: any) {
    if (user.role === 'admin') {
      Swal.fire('無法執行', '不能停權管理員', 'warning');
      return;
    }

    Swal.fire({
      title: '<span style="color: #1e293b; font-weight: 800;">停權用戶設定</span>',
      html: `
        <div class="text-left px-2" style="font-family: inherit;">
          <div class="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
             <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">受處分帳號</div>
             <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  ${user.nickname.charAt(0)}
                </div>
                <div>
                  <div class="text-base font-bold text-slate-800">${user.nickname}</div>
                  <div class="text-xs text-slate-500">${user.email}</div>
                </div>
             </div>
          </div>
          
          <div class="mb-4">
            <label for="swal-hours" class="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <i class="pi pi-clock text-blue-500"></i> 禁用時數設定
            </label>
            <input id="swal-hours" type="number" 
              class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700" 
              placeholder="輸入小時，空值或 0 為永久禁用" min="0">
            <div class="mt-1.5 flex gap-2">
              <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200" onclick="document.getElementById('swal-hours').value=72">3天(72h)</span>
              <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200" onclick="document.getElementById('swal-hours').value=168">7天(168h)</span>
              <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded cursor-pointer hover:bg-slate-200" onclick="document.getElementById('swal-hours').value=720">30天(720h)</span>
            </div>
          </div>

          <div class="mb-1">
            <label for="swal-reason" class="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <i class="pi pi-exclamation-circle text-orange-500"></i> 禁用理由 <span class="text-red-500">*</span>
            </label>
            <textarea id="swal-reason" rows="3"
              class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-700" 
              placeholder="請詳細說明理由，這將顯示給被禁用的用戶看..."></textarea>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定執行停權',
      cancelButtonText: '取消',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'rounded-lg px-6 py-2.5 font-bold',
        cancelButton: 'rounded-lg px-6 py-2.5 font-bold'
      },
      preConfirm: () => {
        const hours = (document.getElementById('swal-hours') as HTMLInputElement).value;
        const reason = (document.getElementById('swal-reason') as HTMLTextAreaElement).value;
        if (!reason) {
          Swal.showValidationMessage('⚠️ 請務必填寫禁用理由');
          return false;
        }
        return { hours: hours ? parseInt(hours) : null, reason: reason };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { hours, reason } = result.value;
        this.authService.banUser(user.id, hours, reason).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '處分已執行',
              text: `已成功對 ${user.nickname} 執行停權。`,
              timer: 2000,
              showConfirmButton: false
            });
            this.loadData();
          },
          error: (err) => Swal.fire('操作失敗', err?.message, 'error')
        });
      }
    });
  }


  /**
   * 恢復用戶帳號
   */
  onUserActive(user: any) {
    Swal.fire({
      title: '確定要恢復此用戶帳號?',
      text: `用戶: ${user.nickname} (${user.email})\n恢復後該用戶將可以正常登入`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '確定恢復',
      cancelButtonText: '取消',
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.activeUser(user.id).subscribe({
          next: () => {
            Swal.fire('已恢復', '該用戶帳號已恢復為活躍狀態', 'success');
            this.loadData();
          },
          error: (err) => Swal.fire('操作失敗', err?.message, 'error')
        });
      }
    });
  }

  /**
   * 變更用戶角色
   */
  onUserRoleChange(user: any, newRole: string) {
    const roleText = newRole === 'admin' ? '管理員' : '一般用戶';
    Swal.fire({
      title: `確定要將「${user.nickname}」調整為${roleText}嗎？`,
      text: '這將會改變該用戶的操作權限',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '確定調整',
      cancelButtonText: '取消',
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.updateUserRole(user.id, newRole).subscribe({
          next: () => {
            Swal.fire('已更新', `該用戶角色已更新為${roleText}`, 'success');
            this.loadData();
          },
          error: (err) => Swal.fire('操作失敗', err?.message, 'error')
        });
      }
    });
  }

  /**
   * 查看活動 (跳轉至跟團頁面)
   */
  onEventView(event: any) {
    this.router.navigate(['/groupbuy-event/group-follow', event.id]);
  }

  /**
   * 打開管理對話框
   */
  onEventManage(event: any) {
    this.selectedEventForManage = event;
    this.displayManageDialog = true;
    this.loadManageData(event.id);
  }

  loadManageData(eventsId: number) {
    this.cart.getPersonalOrdersByEventId(eventsId).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          const list = res.personalOrder || [];
          this.manageMembersMap.update(map => ({
            ...map,
            [eventsId]: list
          }));
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  togglePaymentStatus(member: any, eventsId: number) {
    const isPaid = member.paymentStatus === 'CONFIRMED' || member.paymentStatus === 'PAID';
    const nextStatus = isPaid ? 'UNPAID' : 'CONFIRMED';

    const payload = {
      eventsId: eventsId,
      userId: member.userId,
      paymentStatus: nextStatus,
      totalSum: member.totalSum,
      totalWeight: member.totalWeight,
      personFee: member.personFee
    };

    this.cart.updatePersonalOrder(payload).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.loadManageData(eventsId);
        } else {
          Swal.fire('更新失敗', res.message, 'error');
        }
      },
      error: (err: any) => {
        console.error('Update payment status failed:', err);
        Swal.fire('更新失敗', '系統連線錯誤', 'error');
      }
    });
  }

  togglePickupStatus(member: any, eventsId: number) {
    const newStatus = (member.pickupStatus === 'PICKED_UP') ? 'NOT_PICKED_UP' : 'PICKED_UP';

    const payload = {
      eventsId: eventsId,
      userId: member.userId,
      pickupStatus: newStatus,
      totalSum: member.totalSum,
      totalWeight: member.totalWeight,
      personFee: member.personFee
    };

    this.cart.updatePersonalOrder(payload).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.loadManageData(eventsId);
        } else {
          Swal.fire('更新失敗', res.message, 'error');
        }
      },
      error: (err: any) => {
        console.error('Update pickup status failed:', err);
        Swal.fire('更新失敗', '系統連線錯誤', 'error');
      }
    });
  }

  onComplaint(member: any, eventsId: number) {
    const currentUserId = localStorage.getItem('user_id') || '';
    Swal.fire({
      title: '檢舉成員',
      input: 'textarea',
      inputPlaceholder: '請輸入檢舉原因...',
      inputAttributes: {
        'aria-label': '請輸入檢舉原因'
      },
      showCancelButton: true,
      confirmButtonText: '提交檢舉',
      cancelButtonText: '取消',
      confirmButtonColor: '#ef4444',
      preConfirm: (reason) => {
        if (!reason) {
          Swal.showValidationMessage('請輸入原因！');
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          complaintUuid: currentUserId,
          respondentUuid: member.userId,
          reason: result.value,
          eventId: eventsId
        };

        this.authService.addComplaint(payload).subscribe({
          next: () => {
            Swal.fire('提交成功', '檢舉已送交處理', 'success');
          },
          error: () => {
            Swal.fire('提交失敗', '請稍後再試', 'error');
          }
        });
      }
    });
  }

  exportManageCSV(event: any) {
    this.cart.getOrdersAll(event.id).subscribe({
      next: (res: any) => {
        if (res.code === 200 && res.ordersSearchViewList) {
          const list = res.ordersSearchViewList;
          const rows = [];
          rows.push(`"【管理者-團購管理明細報表】"`);
          rows.push(`"活動名稱：","${event.eventName}"`);
          rows.push(`"商家：","${event.storeName}"`);
          rows.push(`"匯出時間：","${new Date().toLocaleString()}"`);
          rows.push('');
          const headers = ['成員', '商品名稱', '規格與選項', '單價', '數量', '小計', '個人備註', '領取狀態'];
          rows.push(headers.join(','));

          list.forEach((order: any) => {
            const nickname = `"${order.userNickname || '匿名'}"`;
            const menuName = `"${order.menuName}"`;
            const options = `"${this.formatSelectedOptionList(order.selectedOptionList)}"`;
            const unitPrice = order.quantity ? order.subtotal / order.quantity : 0;
            const qty = order.quantity;
            const subtotal = order.subtotal;
            const memo = `"${order.personalMemo || ''}"`;
            const pickupStatus = order.pickupStatus === 'PICKED_UP' ? '已領取' : '未取餐';

            rows.push([nickname, menuName, options, unitPrice, qty, subtotal, memo, pickupStatus].join(','));
          });

          const csvContent = "\uFEFF" + rows.join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `Manage_${event.eventName}_${new Date().toLocaleDateString()}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  notifyMembers(event: any) {
    Swal.fire({
      title: '發送取貨通知?',
      text: `將會發送網頁通知給「${event.eventName}」的所有跟團成員。`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '確定發送',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cart.getPersonalOrdersByEventId(event.id).subscribe({
          next: (res: any) => {
            if (res.code === 200) {
              const list = res.personalOrder || [];
              if (list.length === 0) {
                Swal.fire('目前沒有成員下單', '', 'info');
                return;
              }
              const currentUserId = localStorage.getItem('user_id') || '';
              const req: NotifiMesReq = {
                category: NotifiCategoryEnum.GROUP_BUY,
                title: '管理員取貨通知',
                content: `來自管理員的通知：您參加的團購「${event.eventName}」商品已送達，請儘速取貨！`,
                eventId: event.id,
                userId: currentUserId,
                targetUrl: '/user/orders',
                expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                userNotificationVoList: list.map((m: any) => ({
                  userId: m.userId,
                  email: m.userEmail
                }))
              };
              this.messageService.create(req).subscribe(() => {
                Swal.fire('成功', '通知已發送', 'success');
              });
            }
          }
        });
      }
    });
  }

  formatSelectedOptionList(list: any[]): string {
    if (!Array.isArray(list)) return '';
    return list
      .map(o => `${o.optionName}:${o.value}${o.extraPrice ? `(+${o.extraPrice})` : ''}`)
      .join('、');
  }

  onComplaintResolve(complaint: any) {
    const nextText = complaint.completed ? '標記為未處理?' : '標記為已處理?';
    Swal.fire({
      title: nextText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.setComplaintState(complaint.id).subscribe({
          next: () => {
            Swal.fire({
              toast: true,
              position: 'top',
              icon: 'success',
              title: '處理狀態已更新',
              showConfirmButton: false,
              timer: 1500
            });
            this.loadData();
          },
          error: (err) => Swal.fire('操作失敗', err?.message, 'error')
        });
      }
    });
  }

  getComplaintSeverity(completed: boolean) {
    return completed ? 'success' : 'warn';
  }

  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 4 ? local.substring(0, 4) + '***' : local + '***';
    return maskedLocal + '@' + domain;
  }
}
