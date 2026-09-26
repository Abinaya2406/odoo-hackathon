from app.extensions import db
from app.models.notification import Notification
from app.utils.helpers import paginate

class NotificationService:
    @staticmethod
    def create_notification(title: str, message: str, notification_type: str, user_id: int | None = None) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=notification_type,
            is_read=False,
        )
        db.session.add(notif)
        return notif

    @staticmethod
    def notify_low_stock(product, current_stock: float):
        """Trigger low stock notification."""
        title = f"Low Stock Alert: {product.name}"
        message = (
            f"Product '{product.name}' (SKU: {product.sku}) is below minimum stock level. "
            f"Current stock: {current_stock}, Minimum: {product.minimum_stock}. Reorder recommended."
        )
        return NotificationService.create_notification(
            title=title,
            message=message,
            notification_type="LOW_STOCK"
        )

    @staticmethod
    def notify_out_of_stock(product):
        """Trigger out of stock notification."""
        title = f"Out of Stock Alert: {product.name}"
        message = f"Product '{product.name}' (SKU: {product.sku}) is completely out of stock!"
        return NotificationService.create_notification(
            title=title,
            message=message,
            notification_type="OUT_OF_STOCK"
        )

    @staticmethod
    def get_notifications(user_id: int | None = None, is_read: bool | None = None, page: int = 1, limit: int = 20):
        query = Notification.query
        if user_id is not None:
            # Notifications targeted to user or broadcast (user_id is None)
            query = query.filter((Notification.user_id == user_id) | (Notification.user_id.is_(None)))
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
        query = query.order_by(Notification.created_at.desc())

        result = paginate(query, page, limit)
        return {
            "items": [item.to_dict() for item in result["items"]],
            "pagination": result["pagination"],
            "unread_count": Notification.query.filter_by(is_read=False).count(),
        }

    @staticmethod
    def mark_as_read(notification_id: int) -> dict:
        notif = Notification.query.get(notification_id)
        if not notif:
            raise ValueError("Notification not found.")
        notif.is_read = True
        db.session.commit()
        return notif.to_dict()

    @staticmethod
    def mark_all_as_read(user_id: int | None = None) -> int:
        query = Notification.query.filter_by(is_read=False)
        if user_id is not None:
            query = query.filter((Notification.user_id == user_id) | (Notification.user_id.is_(None)))
        count = query.update({Notification.is_read: True}, synchronize_session=False)
        db.session.commit()
        return count

    @staticmethod
    def delete_notification(notification_id: int) -> bool:
        notif = Notification.query.get(notification_id)
        if not notif:
            raise ValueError("Notification not found.")
        db.session.delete(notif)
        db.session.commit()
        return True
