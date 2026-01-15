import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { SplitterModule } from 'primeng/splitter';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { HttpService } from '../../@service/http.service';
import { Router, RouterLink } from "@angular/router";
import { Category, FeeDescription, MenuCategoriesVoList, MenuVoList, OperatingHoursVoList, ProductOptionGroupsVoList, Stores } from '../../@service/store.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-store',
  imports: [
    StepperModule, ToggleSwitchModule,
    FormsModule, SplitterModule,
    ImageModule, ButtonModule,
    InputTextModule, ScrollPanelModule,
    TableModule, SelectButtonModule, CommonModule,
    DialogModule, ButtonModule, RouterLink,
    InputGroupModule, InputGroupAddonModule, FloatLabelModule,
    InputNumberModule, SelectModule, InputTextModule
  ],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements AfterViewInit {

  constructor(private http: HttpService, private router: Router) { }

  displayEditDialog = false;
  displayAddDialog = false;
  displayStoreInfoDialog = false;
  displaySaveDialog = false;
  displaySpecsDialog = false;
  selectedProduct!: MenuVoList;
  selectedCategoryId!: number;


  storeTab: 'info' | 'orderInfo' = 'info';
  selectedIndex = 0;
  indicatorLeft = 0;
  indicatorWidth = 0;

  selectedCategoryName = '';
  isAdding = false;
  newCategoryName = '';

  // 暫存新增的商品
  currentProduct: MenuVoList = this.getNewProduct();
  optionGroups: ProductOptionGroupsVoList = this.getNewGroups();

  getNewProduct(): MenuVoList {
    return {
      name: '',
      description: '',
      categoryId: 0,
      basePrice: 0,
      image: '',
      isAvailable: true,
      unusual: []
    }
  };

  getNewGroups(): ProductOptionGroupsVoList {
    return {
      name: '',
      isRequired: false,
      maxSelection: 0,
      items: []
    }
  };

  // 要postAPI的
  storeData = {
    storesName: '',
    phone: '',
    address: '',
    category: null as Category | null,
    type: '',
    memo: '',
    image: null as Blob | string | null,
    is_public: false,
    created_by: 'A01',
    operatingHoursVoList: [] as OperatingHoursVoList[],
    fee_description: [] as FeeDescription[],
    menuVoList: [] as MenuVoList[],
    menuCategoriesVoList: [] as MenuCategoriesVoList[],
    productOptionGroupsVoList: [] as ProductOptionGroupsVoList[]
  }

  @ViewChildren('tabBtn') tabBtns!: QueryList<ElementRef>;

  ngOnInit() {
    if (this.store.menuCategoriesVoList.length > 0) {
      this.selectedCategoryName = this.store.menuCategoriesVoList[0].name;
    }
  }

  ngAfterViewInit() {
    this.updateIndicator();
  }

  addStore() {
    this.router.navigateByUrl('/store_upsert');
  }

  editStore(event: Event) {
    event.stopPropagation();
  }

  // 新增分類
  startAdding(event: Event) {
    event.stopPropagation();
    this.isAdding = true;
    this.newCategoryName = '';
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('#newCategoryInput')?.focus();
    }, 0);
  }

  saveProduct() {
    if (this.currentProduct) {
      this.storeData.menuVoList.push({ ...this.currentProduct });
      this.store.menuVoList.push({ ...this.currentProduct }); // 存入假資料
      this.displayAddDialog = false;
    }
  }

  get currentCategoryId(): number {
    const index = this.store.menuCategoriesVoList.findIndex(c => c.name ===
      this.selectedCategoryName);
    return index + 1;
  }

  get filteredProducts() {
    return this.store.menuVoList.filter(item => item.categoryId === this.currentCategoryId);
  }

  selectCategory(name: string, index: number) {
    this.selectedCategoryName = name;
    this.selectedIndex = index;
    setTimeout(() => this.updateIndicator());
  }

  updateIndicator() {
    const tab = this.tabBtns.toArray()[this.selectedIndex]?.nativeElement;
    if (!tab) return;

    this.indicatorLeft = tab.offsetLeft;
    this.indicatorWidth = tab.offsetWidth;
  }

  saveCategory() {
    if (this.newCategoryName.trim()) {
      this.store.menuCategoriesVoList.push({ name: this.newCategoryName, priceLevel: [] });
      this.selectCategory(this.newCategoryName, this.store.menuCategoriesVoList.length - 1);
    }
    this.isAdding = false;
  }

  cancelAdding() {
    this.isAdding = false;
    this.newCategoryName = '';
  }

  selectedFile: File | null = null;
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.storeData.image = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.storeData.image = null;
    this.selectedFile = null;
  }

  addSpecs(){
    this.storeData.productOptionGroupsVoList.push({
      isRequired: false,
      name: '',
      maxSelection: 0,
      items: []
    });
  }
  removeSpecs(index: number){

  }

  openItemDialog(index: number){}

  openEdit(product: MenuVoList) {
    this.selectedProduct = product;
    this.displayEditDialog = true;
  }

  openAdd() {
    this.currentProduct = this.getNewProduct();
    this.displayAddDialog = true;
  }

  opendStoreInfo() {
    this.storeTab = 'info'
    this.displayStoreInfoDialog = true;
  }

  onSaveAll() {
    if (this.store.id == 0) {
      this.http.postApi('http://localhost:8080/store/create', this.storeData)
        .subscribe((res: any) => {
          console.log("crest store:" + res);
        });
    } else {
      this.http.postApi('http://localhost:8080/store/update', this.storeData)
        .subscribe((res: any) => {
          console.log("update store:" + res);
        });
    }
    this.displaySaveDialog = true;
  }

  // 假資料
  store: Stores = {
    id: 1,
    storesname: "可不可 OKORNOT",
    phone: "0988777666",
    address: "台南市歸仁區中正南路1001號",
    category: "餐飲",
    type: "手搖飲",
    memo: "外送請提前一小時訂購",
    image: "okornot.png",
    feeDescription: [
      { km: 1.0, fee: 20 },
      { km: 5.0, fee: 50 }
    ],
    isPublic: true,
    createdBy: "UUID",
    operatingHoursVoList: [
      { week: 1, openTime: "10:00", closeTime: "22:00" },
      { week: 2, openTime: "10:00", closeTime: "22:00" },
      { week: 3, openTime: "10:00", closeTime: "22:00" },
      { week: 4, openTime: "10:00", closeTime: "22:00" },
      { week: 5, openTime: "10:00", closeTime: "23:00" }
    ],
    menuVoList: [
      {
        categoryId: 1,
        name: "經典紅玉",
        description: "嚴選紅玉紅茶",
        basePrice: 35,
        image: "",
        isAvailable: true,
        unusual: ["去冰", "微糖"]
      },
      {
        categoryId: 2,
        name: "波霸紅茶拿鐵",
        basePrice: 45,
        description: "濃醇紅茶融合香濃鮮奶，搭配Q彈波霸，口感層次豐富、甜而不膩。",
        image: "blackMilk.jpeg",
        isAvailable: true,
        unusual: []
      }, {
        categoryId: 2,
        name: "阿華田拿鐵",
        basePrice: 50,
        description: "香濃阿華田巧克力融合鮮奶，口感滑順，甜而不膩，暖心提神飲品。",
        image: "chocolate.jpeg",
        isAvailable: true,
        unusual: []
      }
    ],
    menuCategoriesVoList: [
      {
        name: "純茶",
        priceLevel: [
          { "name": "中杯", "price": 0 },
          { "name": "大杯", "price": 10 }
        ]
      },
      {
        name: "找拿鐵",
        priceLevel: [
          { "name": "中杯", "price": 0 },
          { "name": "大杯", "price": 15 }
        ]
      },
      {
        name: "醇奶",
        priceLevel: [
          { "name": "中杯", "price": 0 },
          { "name": "大杯", "price": 10 }
        ]
      },
    ],
    productOptionGroupsVoList: [
      {
        name: "甜度",
        isRequired: true,
        maxSelection: 1,
        items: [
          { name: "無糖", extraPrice: 0 },
          { name: "半糖", extraPrice: 0 },
          { name: "全糖", extraPrice: 0 }
        ]
      },
      {
        name: "加配料",
        isRequired: false,
        maxSelection: 2,
        items: [
          { name: "黑糖珍珠", extraPrice: 10 },
          { name: "仙草凍", extraPrice: 5 }
        ]
      }
    ]
  }
}
