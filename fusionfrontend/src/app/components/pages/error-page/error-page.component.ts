import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {

  public errorCode: string;
  public errorDetails: string;

  constructor(private router: Router) {
    this.errorDetails = this.router.getCurrentNavigation().extras.state?.details;
    this.errorCode = this.router.getCurrentNavigation().extras.state?.code;
  }

  ngOnInit(): void {
  }

}
