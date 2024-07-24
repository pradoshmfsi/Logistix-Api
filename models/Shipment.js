const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const shipmentSchema = new Schema(
  {
    source: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    destination: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    expectedDelivery: {
      type: Date,
      required: false,
    },
    actualDelivery: {
      type: Date,
      required: false,
    },
    departure: {
      type: Date,
      required: false,
    },
    weight: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

exports.Shipment = mongoose.model("shipment", shipmentSchema);
