from marshmallow import Schema, fields, validate

class AdjustmentCreateSchema(Schema):
    product_id = fields.Int(required=True)
    warehouse_id = fields.Int(required=True)
    location_id = fields.Int(required=True)
    physical_quantity = fields.Float(required=True, validate=validate.Range(min=0.0))
    reason = fields.Str(required=True, validate=validate.Length(min=3, max=255))
