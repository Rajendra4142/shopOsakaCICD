package com.shopOsaka.service;

import com.shopOsaka.model.Order;
import com.shopOsaka.model.OrderItem;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ===== Order Confirmation Email =====
    public void sendOrderConfirmation(Order order) {
        try {
            send(
                order.getUser().getEmail(),
                "✅ Order Confirmed! #" + order.getId()
                    + " - ShopOsaka",
                buildConfirmationEmail(order)
            );
        } catch (Exception e) {
            System.err.println(
                "Confirmation email error: " + e.getMessage());
        }
    }

    // ===== Status Update Email =====
    public void sendStatusUpdate(Order order) {
        try {
            String subject = switch (order.getStatus()) {
                case CONFIRMED -> "✅ Order Confirmed!";
                case SHIPPING  -> "🚚 Order Shipped!";
                case DELIVERED -> "🎉 Order Delivered!";
                case CANCELLED -> "❌ Order Cancelled";
                default        -> "📦 Order Update";
            };

            send(
                order.getUser().getEmail(),
                subject + " #" + order.getId()
                    + " - ShopOsaka",
                buildStatusEmail(order)
            );
        } catch (Exception e) {
            System.err.println(
                "Status email error: " + e.getMessage());
        }
    }

    // ===== Email Send Helper =====
    private void send(String to, String subject, String html)
            throws Exception {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper =
            new MimeMessageHelper(msg, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(msg);
    }

    // ===== Order Confirmation HTML =====
    private String buildConfirmationEmail(Order order) {
        // Order items rows
        StringBuilder rows = new StringBuilder();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                String imgUrl = item.getProduct().getImageUrl();
                String imgHtml = (imgUrl != null && !imgUrl.isEmpty())
                    ? String.format(
                        "<img src='%s' width='60' height='60' "
                        + "style='object-fit:cover;"
                        + "border-radius:8px;display:block;'>",
                        imgUrl)
                    : "<div style='width:60px;height:60px;"
                        + "background:#667eea;border-radius:8px;"
                        + "display:flex;align-items:center;"
                        + "justify-content:center;"
                        + "color:white;font-size:20px;'>🛍️</div>";

                BigDecimal subtotal = item.getPrice()
                    .multiply(java.math.BigDecimal.valueOf(
                        item.getQuantity()));

                rows.append(String.format("""
                    <tr>
                        <td style="padding:12px;
                                   border-bottom:1px solid #f0f0f0;">
                            %s
                        </td>
                        <td style="padding:12px;
                                   border-bottom:1px solid #f0f0f0;">
                            <strong>%s</strong>
                        </td>
                        <td style="padding:12px;
                                   border-bottom:1px solid #f0f0f0;
                                   text-align:center;">
                            %d
                        </td>
                        <td style="padding:12px;
                                   border-bottom:1px solid #f0f0f0;
                                   text-align:right;
                                   color:#e44d26;font-weight:bold;">
                            ¥%s
                        </td>
                    </tr>
                    """,
                    imgHtml,
                    item.getProduct().getName(),
                    item.getQuantity(),
                    subtotal.toPlainString()
                ));
            }
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:20px;
                         background:#f4f4f4;
                         font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;
                        background:white;border-radius:16px;
                        overflow:hidden;
                        box-shadow:0 4px 20px rgba(0,0,0,0.1);">

                <!-- Header -->
                <div style="background:linear-gradient(
                                135deg,#667eea,#764ba2);
                            padding:30px;text-align:center;
                            color:white;">
                    <h1 style="margin:0;font-size:28px;">
                        🛒 ShopOsaka
                    </h1>
                    <p style="margin:8px 0 0;font-size:18px;
                              opacity:0.95;">
                        ✅ Order Confirmed!
                    </p>
                </div>

                <!-- Body -->
                <div style="padding:30px;">
                    <h3 style="color:#333;margin-top:0;">
                        Hello, %s! 🎉
                    </h3>
                    <p style="color:#666;">
    Your order has been successfully placed!
</p>

                    <!-- Order Info -->
                    <div style="background:#f8f9fa;
                                border-radius:12px;padding:20px;
                                margin-bottom:20px;">
                        <table style="width:100%;">
                            <tr>
                                <td style="color:#666;
                                           padding:4px 0;">
                                    <strong>Order ID:</strong>
                                </td>
                                <td style="text-align:right;
                                           font-weight:bold;">
                                    #%d
                                </td>
                            </tr>
                            <tr>
                                <td style="color:#666;
                                           padding:4px 0;">
                                    <strong>Date:</strong>
                                </td>
                                <td style="text-align:right;">
                                    %s
                                </td>
                            </tr>
                            <tr>
                                <td style="color:#666;
                                           padding:4px 0;">
                                    <strong>Ship to:</strong>
                                </td>
                                <td style="text-align:right;">
                                    %s
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Items Table -->
                    <table style="width:100%;
                                  border-collapse:collapse;
                                  margin-bottom:20px;">
                        <thead>
                            <tr style="background:#f8f9fa;">
                                <th style="padding:12px;
                                           text-align:left;
                                           border-radius:8px 0 0 0;">
                                    Image
                                </th>
                                <th style="padding:12px;
                                           text-align:left;">
                                    Product
                                </th>
                                <th style="padding:12px;
                                           text-align:center;">
                                    Qty
                                </th>
                                <th style="padding:12px;
                                           text-align:right;
                                           border-radius:0 8px 0 0;">
                                    Price
                                </th>
                            </tr>
                        </thead>
                        <tbody>%s</tbody>
                    </table>

                    <!-- Total -->
                    <div style="text-align:right;
                                background:#f8f9fa;
                                border-radius:12px;
                                padding:15px 20px;
                                margin-bottom:20px;">
                        <span style="font-size:20px;
                                     font-weight:bold;
                                     color:#e44d26;">
                            Total: ¥%s
                        </span>
                    </div>

                    <!-- Track Order -->
                    <div style="text-align:center;
                                border:2px solid #667eea;
                                border-radius:12px;
                                padding:20px;">
                        <p style="margin:0 0 12px;
                                  color:#667eea;font-weight:bold;">
                            🚚 Track Your Order
                        </p>
                        <a href="http://localhost:8080/orders"
                           style="background:linear-gradient(
                                      135deg,#667eea,#764ba2);
                                  color:white;padding:10px 25px;
                                  border-radius:8px;
                                  text-decoration:none;
                                  font-weight:bold;">
                            View My Orders
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background:#f8f9fa;padding:20px;
                            text-align:center;color:#999;
                            font-size:12px;">
                    © 2024 ShopOsaka 🛒 | Osaka, Japan 🇯🇵
                </div>
            </div>
            </body>
            </html>
            """,
            order.getUser().getFullName(),
            order.getId(),
            order.getOrderedAt() != null
                ? order.getOrderedAt().toLocalDate().toString()
                : "",
            order.getShippingAddress() != null
                ? order.getShippingAddress() : "",
            rows.toString(),
            order.getTotalAmount().toPlainString()
        );
    }

    // ===== Status Update HTML =====
    private String buildStatusEmail(Order order) {
    	String statusMsg = switch (order.getStatus()) {
        case CONFIRMED ->
            "✅ Your order has been confirmed! It will be shipped soon.";
        case SHIPPING  ->
            "🚚 Your order has been shipped! It will arrive soon.";
        case DELIVERED ->
            "🎉 Your order has been delivered!";
        case CANCELLED ->
            "❌ Your order has been cancelled.";
        default ->
            "📦 Order status updated.";
    };
        String bgColor = switch (order.getStatus()) {
            case CONFIRMED -> "#28a745";
            case SHIPPING  -> "#17a2b8";
            case DELIVERED -> "#667eea";
            case CANCELLED -> "#dc3545";
            default        -> "#6c757d";
        };

        // Order items preview
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                String imgUrl = item.getProduct().getImageUrl();
                itemsHtml.append(String.format("""
                    <div style="display:flex;align-items:center;
                                gap:12px;margin-bottom:12px;
                                padding:10px;background:#f8f9fa;
                                border-radius:8px;">
                        %s
                        <div>
                            <div style="font-weight:bold;">%s</div>
                            <small style="color:#666;">
                                ¥%s × %d
                            </small>
                        </div>
                    </div>
                    """,
                    (imgUrl != null && !imgUrl.isEmpty())
                        ? String.format(
                            "<img src='%s' width='50' height='50' "
                            + "style='object-fit:cover;"
                            + "border-radius:6px;flex-shrink:0;'>",
                            imgUrl)
                        : "<div style='width:50px;height:50px;"
                            + "background:#667eea;border-radius:6px;"
                            + "display:flex;align-items:center;"
                            + "justify-content:center;"
                            + "color:white;'>🛍️</div>",
                    item.getProduct().getName(),
                    item.getPrice().toPlainString(),
                    item.getQuantity()
                ));
            }
        }

        return String.format("""
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:20px;
                         background:#f4f4f4;
                         font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:0 auto;
                        background:white;border-radius:16px;
                        overflow:hidden;
                        box-shadow:0 4px 20px rgba(0,0,0,0.1);">

                <div style="background:linear-gradient(
                                135deg,#667eea,#764ba2);
                            padding:30px;text-align:center;
                            color:white;">
                    <h1 style="margin:0;font-size:28px;">
                        🛒 ShopOsaka
                    </h1>
                </div>

                <div style="padding:30px;">
                    <!-- Status Badge -->
                    <div style="text-align:center;
                                margin-bottom:20px;">
                        <span style="background:%s;color:white;
                                     padding:8px 20px;
                                     border-radius:20px;
                                     font-size:16px;
                                     font-weight:bold;">
                            %s
                        </span>
                    </div>

                    <h3 style="color:#333;text-align:center;">
                        Order #%d Update
                    </h3>
                    <p style="color:#666;text-align:center;">
                        %s
                    </p>

                    <!-- Items Preview -->
                    <div style="margin:20px 0;">%s</div>

                    <!-- Total -->
                    <div style="text-align:right;
                                background:#f8f9fa;
                                border-radius:8px;
                                padding:12px 20px;
                                margin-bottom:20px;">
                        <strong style="color:#e44d26;">
                            Total: ¥%s
                        </strong>
                    </div>

                    <!-- Button -->
                    <div style="text-align:center;">
                        <a href="http://localhost:8080/orders"
                           style="background:linear-gradient(
                                      135deg,#667eea,#764ba2);
                                  color:white;padding:12px 30px;
                                  border-radius:8px;
                                  text-decoration:none;
                                  font-weight:bold;
                                  display:inline-block;">
                            Track My Order
                        </a>
                    </div>
                </div>

                <div style="background:#f8f9fa;padding:15px;
                            text-align:center;color:#999;
                            font-size:12px;">
                    © 2024 ShopOsaka 🛒 | Osaka, Japan 🇯🇵
                </div>
            </div>
            </body>
            </html>
            """,
            bgColor,
            order.getStatus().toString(),
            order.getId(),
            statusMsg,
            itemsHtml.toString(),
            order.getTotalAmount().toPlainString()
        );
    }
}