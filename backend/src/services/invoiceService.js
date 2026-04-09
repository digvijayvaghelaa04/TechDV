const PDFDocument = require('pdfkit');
const fs = require('fs');
const Invoice = require('../models/Invoice');
const path = require('path');

// This is a simplified version. In production, upload to S3/Cloudinary and return URL.
exports.generateInvoice = async (order, user) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const invoiceName = `Invoice-${order._id}.pdf`;
        const invoicePath = path.join(__dirname, '../uploads', invoiceName);

        // Ensure uploads dir exists
        if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
            fs.mkdirSync(path.join(__dirname, '../uploads'), { recursive: true });
        }

        const writeStream = fs.createWriteStream(invoicePath);
        doc.pipe(writeStream);

        // Header
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('TechDV', 50, 57)
            .fontSize(10)
            .text('123 TechDV Street', 200, 65, { align: 'right' })
            .text('New York, NY, 10025', 200, 80, { align: 'right' })
            .moveDown();

        // Invoice Info
        doc
            .fillColor('#000000')
            .fontSize(20)
            .text('Invoice', 50, 160);

        doc
            .fontSize(10)
            .text(`Invoice Number: ${order._id}`, 50, 200)
            .text(`Invoice Date: ${new Date().toDateString()}`, 50, 215)
            .text(`Balance Due: $0.00`, 50, 230)
            .text(user.firstName + ' ' + user.lastName, 300, 200, { align: 'right' })
            .text(user.email, 300, 215, { align: 'right' })
            .moveDown();

        // Table Header
        const invoiceTableTop = 330;
        doc.font("Helvetica-Bold");
        doc.text("Item", 50, invoiceTableTop);
        doc.text("Description", 250, invoiceTableTop);
        doc.text("Amount", 500, invoiceTableTop, { align: "right" });

        // Items
        let i = 0;
        let position = 0;
        doc.font("Helvetica");

        order.orderItems.forEach(item => {
            position = invoiceTableTop + (i + 1) * 30;
            doc.text(item.title, 50, position);
            doc.text("Course Access", 250, position);
            doc.text("$" + item.price, 500, position, { align: "right" });
            i++;
        });

        // Totals
        const subtotalPosition = position + 30;
        doc.text("Subtotal", 400, subtotalPosition);
        doc.text("$" + order.itemsPrice, 500, subtotalPosition, { align: "right" });

        const taxPosition = subtotalPosition + 15;
        doc.text("Tax", 400, taxPosition);
        doc.text("$" + order.taxPrice, 500, taxPosition, { align: "right" });

        const totalPosition = taxPosition + 25;
        doc.font("Helvetica-Bold");
        doc.text("Total", 400, totalPosition);
        doc.text("$" + order.totalPrice, 500, totalPosition, { align: "right" });

        // Footer
        doc
            .fontSize(10)
            .text(
                "Thank you for your business. For any questions, contact support@techdv.com",
                50,
                700,
                { align: "center", width: 500 }
            );

        doc.end();

        writeStream.on('finish', async () => {
            // In real app, upload stream to Cloudinary here
            const invoice = await Invoice.create({
                order: order._id,
                user: user._id,
                invoiceNumber: `INV-${Date.now()}`,
                pdfUrl: `/uploads/${invoiceName}`, // Local path for now
                amount: order.totalPrice
            });
            resolve(invoice);
        });

        writeStream.on('error', (err) => {
            reject(err);
        });
    });
};
