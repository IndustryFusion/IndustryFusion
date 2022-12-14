import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root'})
export class UploadDownloadService {

  constructor(private http: HttpClient,
              private messageService: MessageService,
  ) {
  }

  downloadFile(route: string, filename: string = null): void {
    this.http.get(route, { responseType: 'blob'}).subscribe(
      (response: any) => {
        const dataType = response.type;
        const binaryData = [];
        binaryData.push(response);
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType}));
        if (filename) {
          downloadLink.setAttribute('download', filename);
        }
        document.body.appendChild(downloadLink);
        downloadLink.click();
      }
    );
  }

  uploadFile(route: string, file: File, executeOnSuccess?: () => void) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    this.http.post(route, formData).subscribe(
      success => {
        if (executeOnSuccess !== undefined) {
          executeOnSuccess();
        }
        this.successMessage(success);
      }, error => {
        console.log(error);
      }
    );
  }

  private successMessage(result) {
    const message = {
      severity: 'success',
      summary: 'Import completed',
      detail: result.message,
      sticky: true,
    };
    this.messageService.add(message);
  }
}
