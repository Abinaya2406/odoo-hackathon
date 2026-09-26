from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class TransferCreateSchema(Schema):
    product_id = fields.Int(required=True)
    quantity = fields.Float(required=True, validate=validate.Range(min=0.0001, min_inclusive=True))
    source_warehouse_id = fields.Int(required=True)
    source_location_id = fields.Int(required=True)
    destination_warehouse_id = fields.Int(required=True)
    destination_location_id = fields.Int(required=True)
    notes = fields.Str(allow_none=True)

    @validates_schema
    def validate_locations(self, data, **kwargs):
        if data.get("source_location_id") == data.get("destination_location_id"):
            raise ValidationError("Source and destination locations cannot be the same.", "destination_location_id")

class TransferUpdateSchema(Schema):
    notes = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(["DRAFT", "READY", "DONE", "CANCELLED"]))
