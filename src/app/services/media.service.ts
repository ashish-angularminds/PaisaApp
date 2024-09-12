import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  constructor(private http:HttpClient) { }

  uploadImg(selectedFile:File | null){
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'demo-preset');
  
      const uploadUrl = `https://api.cloudinary.com/v1_1/dos9gxfc0/image/upload`;
  
      this.http.post(uploadUrl, formData).subscribe((response: any) => {
        console.log('Upload successful:', response);
        resolve(response);
      }, (error) => {
        console.error('Upload error:', error);
        reject(error);
      });
    });
    
  }
}
