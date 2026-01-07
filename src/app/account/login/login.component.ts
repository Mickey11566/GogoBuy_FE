import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // 模式: 登入 | 註冊
  pageMode: 'login' | 'register' = 'login';

  // 表單資料模型
  user = {
    nickname: '',
    email: '',
    phone: '',
    password: ''
  };

  // 切換模式
  toggleMode() {
    this.pageMode = this.pageMode === 'login' ? 'register' : 'login';
    this.resetForm();
  }

  // 清空所有欄位
  resetForm() {
    this.user = { nickname: '', email: '', phone: '', password: '' };
  }

  // 送出註冊資料
  onSubmit() {
    console.log("註冊提交資料:" + JSON.stringify(this.user, null, 2));
    // POST
  }

}
