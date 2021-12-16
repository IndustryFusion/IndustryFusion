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
      { label: 'English', value: 'en' },
      { label: 'German', value: 'de' },
      { label: 'French', value: 'fr' },
    ];
    // this.languageTypes = [
    //   { label: this.translate.instant('APP.SHARED.UI.HEADER.TRANSLATE_NAV.ENGLISH'), value: 'en' },
    //   { label: this.translate.instant('APP.SHARED.UI.HEADER.TRANSLATE_NAV.GERMAN'), value: 'de' },
    //   { label: this.translate.instant('APP.SHARED.UI.HEADER.TRANSLATE_NAV.FRENCH'), value: 'fr' },
    // ];
  }

  ngOnInit(): void {
    // this.lang = localStorage.getItem('lang') || 'en';
    this.selectedLanguage = localStorage.getItem('lang') || 'en';
  }

  changeLang(lang?) {
    console.log(lang);
    localStorage.setItem('lang', this.selectedLanguage);
    // localStorage.setItem('lang', lang);
    window.location.reload();
  }

}
