const express = require("express");
const router = express.Router();
const { uResponse } = require("../../utils");
const { Orientation, Interest } = require("../../models");
/**
 * Home page: loading all place
 */
router.get("/", async (req, res) => {
  try {
    const query = {
      status: Orientation.STATUS.ACTIVE,
    };

    const orientations = await Orientation.find(query)
      .select({ _id: 1, title: 1, color: 1 })
      .lean();
    const interests = await Interest.find(query)
      .select({ _id: 1, title: 1, color: 1 })
      .lean();
    return uResponse.createResponse(res, 200, {
      orientations,
      interests,
    });
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

router.post("/orientation", async (req, res) => {
  try {
    const { title, color, sort } = req.body;

    const dataCreate = {
      title,
      color,
      sort,
      status: Orientation.STATUS.ACTIVE,
    };

    let newObj = new Orientation(dataCreate);
    const data = await newObj.save();
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

router.post("/interest", async (req, res) => {
  try {
    const { title, color, sort } = req.body;

    const dataCreate = {
      title,
      color,
      sort,
      status: Interest.STATUS.ACTIVE,
    };

    let newObj = new Interest(dataCreate);
    const data = await newObj.save();
    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

router.put("/orientation/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, color, sort } = req.body;

    if (title) {
      dataUpdate.title = title;
    }
    if (color) {
      dataUpdate.color = color;
    }
    if (sort) {
      dataUpdate.sort = sort;
    }

    let data = await Orientation.findByIdAndUpdate(
      id,
      {
        $set: dataUpdate,
      },
      { new: true }
    );

    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

router.put("/interest/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { title, color, sort } = req.body;

    if (title) {
      dataUpdate.title = title;
    }
    if (color) {
      dataUpdate.color = color;
    }
    if (sort) {
      dataUpdate.sort = sort;
    }

    let data = await Interest.findByIdAndUpdate(
      id,
      {
        $set: dataUpdate,
      },
      { new: true }
    );

    return uResponse.createResponse(res, 200, data);
  } catch (error) {
    return uResponse.createResponse(res, 500, null, error.message, error);
  }
});

module.exports = router;
