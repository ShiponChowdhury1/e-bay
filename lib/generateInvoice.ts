"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { OrderType } from "@/types";

export function generateInvoicePDF(order: OrderType) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue
  const textColor: [number, number, number] = [55, 65, 81];
  const lightGray: [number, number, number] = [156, 163, 175];

  // Header - Company Logo/Name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("eBay", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE", pageWidth - 20, 20, { align: "right" });
  doc.text(`#${order._id.slice(-8).toUpperCase()}`, pageWidth - 20, 28, { align: "right" });

  // Invoice Details
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  
  let yPos = 55;
  
  // Left side - Bill To
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 7;
  
  if (order.shippingAddress) {
    doc.text(order.shippingAddress.fullName, 20, yPos);
    yPos += 5;
    doc.text(order.shippingAddress.street, 20, yPos);
    yPos += 5;
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 20, yPos);
    yPos += 5;
    doc.text(order.shippingAddress.country, 20, yPos);
    yPos += 5;
    doc.text(`Phone: ${order.shippingAddress.phone}`, 20, yPos);
  }

  // Right side - Invoice Details
  const rightX = pageWidth - 70;
  let rightY = 55;
  
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Date:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }), rightX + 50, rightY, { align: "right" });
  
  rightY += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Order Status:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1), rightX + 50, rightY, { align: "right" });
  
  rightY += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Status:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  const paymentStatusColor = order.paymentStatus === "paid" ? [34, 197, 94] : [234, 179, 8];
  doc.setTextColor(...(paymentStatusColor as [number, number, number]));
  doc.text(order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1), rightX + 50, rightY, { align: "right" });
  doc.setTextColor(...textColor);
  
  rightY += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Payment Method:", rightX, rightY);
  doc.setFont("helvetica", "normal");
  doc.text(order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1), rightX + 50, rightY, { align: "right" });

  // Items Table
  yPos = 105;
  
  const tableData = order.items?.map((item, index) => [
    index + 1,
    item.title,
    item.quantity,
    `$${item.price.toFixed(2)}`,
    `$${(item.price * item.quantity).toFixed(2)}`
  ]) || [];

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Item Description", "Qty", "Unit Price", "Amount"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      textColor: textColor,
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  // Get final Y position after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 50;

  // Summary Box
  const summaryX = pageWidth - 90;
  let summaryY = finalY + 15;
  
  // Draw summary box
  doc.setDrawColor(...lightGray);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(summaryX - 10, summaryY - 8, 80, 58, 3, 3, "FD");

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  
  doc.text("Subtotal:", summaryX, summaryY);
  doc.text(`$${order.totalAmount.toFixed(2)}`, pageWidth - 25, summaryY, { align: "right" });
  
  summaryY += 10;
  doc.text("Shipping:", summaryX, summaryY);
  doc.text(`$${order.shippingCost.toFixed(2)}`, pageWidth - 25, summaryY, { align: "right" });
  
  summaryY += 10;
  doc.text("Tax:", summaryX, summaryY);
  doc.text(`$${order.tax.toFixed(2)}`, pageWidth - 25, summaryY, { align: "right" });
  
  summaryY += 12;
  doc.setDrawColor(...primaryColor);
  doc.line(summaryX - 5, summaryY - 5, pageWidth - 20, summaryY - 5);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Grand Total:", summaryX, summaryY);
  doc.setTextColor(...primaryColor);
  doc.text(`$${order.grandTotal.toFixed(2)}`, pageWidth - 25, summaryY, { align: "right" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(...lightGray);
  doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
  
  doc.setTextColor(...lightGray);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your purchase!", pageWidth / 2, footerY, { align: "center" });
  doc.text("If you have any questions, please contact support@ebay.com", pageWidth / 2, footerY + 6, { align: "center" });
  
  // Payment Status Badge (if paid)
  if (order.paymentStatus === "paid") {
    doc.setFillColor(34, 197, 94);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    
    // Rotate and draw "PAID" stamp
    doc.saveGraphicsState();
    doc.setGState(new (doc as unknown as { GState: new (opts: { opacity: number }) => object }).GState({ opacity: 0.3 }));
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(60);
    doc.text("PAID", 50, 200, { angle: 45 });
    doc.restoreGraphicsState();
  }

  // Save the PDF
  const fileName = `Invoice_${order._id.slice(-8).toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
