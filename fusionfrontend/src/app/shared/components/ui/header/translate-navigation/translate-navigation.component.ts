import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-translate-navigation',
  templateUrl: './translate-navigation.component.html',
  styleUrls: ['./translate-navigation.component.scss']
})
export class TranslateNavigationComponent implements OnInit {

  lang: string;
  languageTypes: SelectItem[];
  selectedLanguage: string;

  constructor() {
    this.languageTypes = [
      { label: "English", value: "en" },
      { label: "German", value: "de" },
      { label: "French", value: "fr" },
    ];
    // this.languageTypes = [
    //   { label: this.translate.instant('APP.SHARED.UI.HEADER.TRANSLATE_NAVIGATION.ENGLISH'), value: "en" },
    //   { label: this.translate.instant('APP.SHARED.UI.HEADER.TRANSLATE_NAVIGATION.GERMAN'), value: "de" },
    //   { label: this.translate.instant('APP.SHARED.UI.HEADER.TRANSLATE_NAVIGATION.FRENCH'), value: "fr" },
    // ];
  }

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang') || 'en';
  }

  changeLang() {
    localStorage.setItem('lang', this.selectedLanguage);
    window.location.reload();
  }

}
