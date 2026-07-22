import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;
import { type Express } from 'express';
@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ message: string; image: CloudinaryResponse }> {
    const imgBuffer = file.buffer;
    const imageBase64 = Buffer.from(imgBuffer).toString('base64');
    const pathImage = `data:${file.mimetype};base64,${imageBase64}`;
    try {
      const image = await cloudinary.uploader.upload(pathImage);
      return {
        message: 'Archivo subido con exito!',
        image,
      };
    } catch (error) {
      console.log(error, 'no subio la imagen a cloudinary');
      throw new BadRequestException(
        'No fue posible subir el archivo a cloudinary',
      );
    }
  }
}
