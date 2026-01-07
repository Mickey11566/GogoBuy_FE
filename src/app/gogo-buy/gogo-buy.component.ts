import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-gogo-buy',
  imports: [
    CarouselModule
  ],
  templateUrl: './gogo-buy.component.html',
  styleUrl: './gogo-buy.component.scss'
})
export class GogoBuyComponent {
  //輪播圖片
  banners: Banner[] = [
    {
      //位置
      image: 'Bubble.png',
      //圖片無法顯示時文字
      title: '揪團喝珍奶'
    },
    {
      image: 'JapaneseFood.png',
      title: '日式料理團購開團中'
    },
    {
      image: 'fastFood.png',
      title: '速食限時優惠'
    }
  ];

}

export interface Banner {
  image: string;
  title?: string;
  link?: string;
}
