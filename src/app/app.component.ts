import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gogobuy';

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    Swal.fire("SweetAlert2 is working!");

  }
}
