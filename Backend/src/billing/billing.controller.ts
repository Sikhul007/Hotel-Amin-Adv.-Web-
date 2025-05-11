import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Response } from 'express';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('room/:roomNum')
  async generateBillingPdf(
    @Param('roomNum', ParseIntPipe) roomNum: number,
    @Res() res: Response,
  ) {
    const { pdfBuffer, responseDto } = await this.billingService.generateBillingPdf(roomNum);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${responseDto.booking_id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}