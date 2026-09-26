from marshmallow import Schema, fields, validate, validates, ValidationError

class ProductCreateSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    sku = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    category_id = fields.Int(allow_none=True)
    supplier_id = fields.Int(allow_none=True)
    unit_of_measure = fields.Str(load_default="units", validate=validate.Length(max=50))
    minimum_stock = fields.Float(load_default=10.0, validate=validate.Range(min=0))
    maximum_stock = fields.Float(load_default=1000.0, validate=validate.Range(min=0))
    reorder_quantity = fields.Float(load_default=50.0, validate=validate.Range(min=0))
    cost_price = fields.Float(load_default=0.0, validate=validate.Range(min=0))


class ProductUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=1, max=150))
    sku = fields.Str(validate=validate.Length(min=1, max=100))
    category_id = fields.Int(allow_none=True)
    supplier_id = fields.Int(allow_none=True)
    unit_of_measure = fields.Str(validate=validate.Length(max=50))
    minimum_stock = fields.Float(validate=validate.Range(min=0))
    maximum_stock = fields.Float(validate=validate.Range(min=0))
    reorder_quantity = fields.Float(validate=validate.Range(min=0))
    cost_price = fields.Float(validate=validate.Range(min=0))

class CategorySchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(allow_none=True)

class SupplierSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=150))
    email = fields.Email(allow_none=True)
    phone = fields.Str(allow_none=True, validate=validate.Length(max=30))
    address = fields.Str(allow_none=True)

class WarehouseSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    location = fields.Str(allow_none=True, validate=validate.Length(max=255))
    capacity = fields.Float(load_default=0.0, validate=validate.Range(min=0))

class LocationSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    rack_number = fields.Str(allow_none=True, validate=validate.Length(max=50))
    capacity = fields.Float(load_default=0.0, validate=validate.Range(min=0))
