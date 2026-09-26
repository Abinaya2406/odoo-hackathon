from marshmallow import Schema, fields, validate, validates, ValidationError

class ReceiptItemInputSchema(Schema):
    product_id = fields.Int(required=True)
    quantity = fields.Float(required=True, validate=validate.Range(min=0.0001, min_inclusive=True))
    location_id = fields.Int(allow_none=True)

class ReceiptCreateSchema(Schema):
    supplier_id = fields.Int(allow_none=True)
    warehouse_id = fields.Int(required=True)
    notes = fields.Str(allow_none=True)
    receipt_date = fields.DateTime(allow_none=True)
    items = fields.List(fields.Nested(ReceiptItemInputSchema), required=True, validate=validate.Length(min=1))

class ReceiptUpdateSchema(Schema):
    supplier_id = fields.Int(allow_none=True)
    warehouse_id = fields.Int()
    notes = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"]))
    items = fields.List(fields.Nested(ReceiptItemInputSchema))
