const express = require("express");
const router = express.Router();
const { Location } = require("../models/Location");
const { User } = require("../models/User");
const { Shipment } = require("../models/Shipment");
const Auth = require("../middlewares/Auth");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

router.get("/locations", async (req, res) => {
  try {
    const locations = await Location.find();
    if (locations.length == 0) {
      return res.status(400).json({
        message: "No locations found",
      });
    } else {
      return res.status(200).json({
        summary: {
          message: "Locations retrieved successfully",
          totalcount: `${locations.length}`,
        },
        locations,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Sommething went wrong",
      error: err.message,
    });
  }
});

router.post("/shipments/userId=:userId", Auth, async (req, res) => {
  try {
    let { filters, pagination, sortData } = req.body;
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("location").exec();

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const locationId = user.location;

    const initialFilters = {
      $or: [
        { source: locationId },
        { destination: locationId },
        { createdBy: mongoose.Types.ObjectId(userId) },
      ],
    };

    if (filters.source) {
      filters.source = mongoose.Types.ObjectId(filters.source._id);
    }

    if (filters.destination) {
      filters.destination = mongoose.Types.ObjectId(filters.destination._id);
    }

    if (filters.createdBy) {
      filters.createdBy = mongoose.Types.ObjectId(filters.createdBy);
    }

    if (filters.createdFrom && filters.createdTo) {
      filters.createdAt = {
        $gte: new Date(filters.createdFrom),
        $lte: new Date(filters.createdTo),
      };
    }

    processedfilters = Object.keys(filters)
      .filter(
        (key) =>
          Boolean(filters[key]) && !(key == "createdFrom" || key == "createdTo")
      )
      .map((key) => ({ [key]: filters[key] }));

    const finalFilters = [initialFilters, ...processedfilters];
    // const shipments = await Shipment.find({
    //   $and: finalFilters,
    // })
    //   .skip((pagination.page - 1) * pagination.limit)
    //   .limit(pagination.limit);
    let shipments = await Shipment.aggregate([
      {
        $match: {
          $and: finalFilters,
        },
      },
      {
        $facet: {
          totalCount: [
            {
              $count: "count",
            },
          ],
          data: [
            {
              $sort: sortData,
            },
            {
              $skip: (pagination.page - 1) * pagination.limit,
            },
            {
              $limit: pagination.limit,
            },
            {
              $lookup: {
                from: "locations",
                localField: "source",
                foreignField: "_id",
                as: "sourceLocation",
              },
            },
            {
              $lookup: {
                from: "locations",
                localField: "destination",
                foreignField: "_id",
                as: "destinationLocation",
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "createdByUser",
              },
            },
            {
              $project: {
                _id: 1,
                weight: 1,
                departure: 1,
                arrival: 1,
                expectedDelivery: 1,
                actualDelivery: 1,
                description: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                source: { $arrayElemAt: ["$sourceLocation", 0] },
                destination: {
                  $arrayElemAt: ["$destinationLocation", 0],
                },
                createdBy: {
                  name: { $arrayElemAt: ["$createdByUser.name", 0] },
                  _id: { $arrayElemAt: ["$createdByUser._id", 0] },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
          data: 1,
        },
      },
    ]);

    return res.status(200).json({
      summary: {
        message: "Shipments retrieved successfully",
        totalcount: shipments[0].totalCount || 0,
      },
      shipments: shipments[0].data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Sommething went wrong",
      error: err.message,
    });
  }
});

router.get(
  "/shipments/shipmentId=:shipmentId&userId=:userId",
  Auth,
  async (req, res) => {
    try {
      const { shipmentId, userId } = req.params;
      const user = await User.findById(userId).populate("location").exec();

      if (!user) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const locationId = user.location;

      // const initialFilters = {
      //   $or: [
      //     { source: locationId },
      //     { destination: locationId },
      //     { createdBy: userId },
      //   ],
      // };

      let shipment = await Shipment.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(shipmentId),
            $or: [
              { source: locationId },
              { destination: locationId },
              { createdBy: mongoose.Types.ObjectId(userId) },
            ],
          },
        },
        {
          $lookup: {
            from: "locations",
            localField: "source",
            foreignField: "_id",
            as: "sourceLocation",
          },
        },
        {
          $lookup: {
            from: "locations",
            localField: "destination",
            foreignField: "_id",
            as: "destinationLocation",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "createdByUser",
          },
        },
        {
          $project: {
            _id: 1,
            weight: 1,
            departure: 1,
            arrival: 1,
            expectedDelivery: 1,
            actualDelivery: 1,
            description: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            source: { $arrayElemAt: ["$sourceLocation", 0] },
            destination: {
              $arrayElemAt: ["$destinationLocation", 0],
            },
            createdBy: {
              name: { $arrayElemAt: ["$createdByUser.name", 0] },
              _id: { $arrayElemAt: ["$createdByUser._id", 0] },
            },
          },
        },
      ]);

      return res.status(200).json({
        summary: {
          message: `Shipment retrieved successfully`,
        },
        shipment: shipment[0],
      });
    } catch (err) {
      return res.status(500).json({
        message: "Sommething went wrong",
        error: err.message,
      });
    }
  }
);

router.post("/shipments/route", Auth, async (req, res) => {
  const { origin, destination } = req.body;
  const response = await axios.get(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      params: {
        api_key: process.env.OSM_API_KEY,
        start: `${origin[1]},${origin[0]}`,
        end: `${destination[1]},${destination[0]}`,
      },
    }
  );
  const route = response.data.features[0].geometry.coordinates.map((coord) => [
    coord[1],
    coord[0],
  ]);
  try {
    return res.status(200).json({
      summary: {
        message: `Route fetched successfully`,
      },
      route: route,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Sommething went wrong",
      error: err.message,
    });
  }
});

router.post("/shipments/add", Auth, async (req, res) => {
  try {
    let shipment = req.body;
    let expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 2);
    shipment = {
      ...shipment,
      expectedDelivery: expectedDelivery,
      departure: new Date(),
    };
    shipment = new Shipment(shipment);
    await shipment.save();
    return res.status(201).json({
      summary: {
        message: "Shipment saved successfully",
      },
      shipment,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

router.put("/shipments/update/:shipmentId", Auth, async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    let shipment = await Shipment.findById(shipmentId);
    const updates = req.body;
    if (shipment) {
      Object.keys(updates).forEach((key) => {
        shipment[key] = updates[key];
      });

      await shipment.save();
      return res.status(201).json({
        message: `Shipment with id ${shipmentId} updated successfully`,
      });
    } else {
      return res.status(400).json({
        message: "No such id found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

module.exports = router;
