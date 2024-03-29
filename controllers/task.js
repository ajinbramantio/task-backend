const Task = require('../models/TaskModel')

exports.CreateTask = async (req, res) => {
  try {
    const userId = req.auth._id
    const newTask = {
      ...req.body,
      creator: userId
    }
    const result = await Task.create(newTask)
    res.send({
      message: 'create Task',
      data: result
    })
  } catch (error) {
    console.log(error.name)
  }
}

exports.Get_Task = async (req, res) => {
  // console.log('test')

  const userId = req.auth._id
  const foundTask = await Task.find({ creator: userId }).populate(
    'creator',
    'userName role'
  )
  const foundTaskAll = await Task.find().populate('creator', 'userName role')
  // console.log(foundTaskAll)

  if (req.auth.role == process.env.R) {
    return res.send({
      message: 'get success',
      data: foundTaskAll
    })
  }

  return res.send({
    message: 'get success',
    data: foundTask
  })
}

exports.Edit_Task = async (req, res) => {
  const taskId = req.params.taskId
  if (taskId) {
    const foundTask = await Task.findById({ _id: taskId }).populate(
      'creator',
      'userName role'
    )
    return res.send({
      message: 'Edit',
      data: foundTask
    })
  }
  // console.log(foundTask)
  res.send({
    message: 'Edit fail'
  })
}

exports.Update_Task = async (req, res) => {
  // const userId = req.auth._id
  const creatorId = req.params.userId
  const taskId = req.params.taskId

  const foundTask = await Task.findById({ _id: taskId })
  // console.log(req.auth._id, req.params.userId)

  // console.log(typeof foundTask._id, typeof taskId)
  if (foundTask === null) {
    return res.send({
      message: 'update fail, data not there'
    })
  } else if (String(foundTask._id) === taskId) {
    const UpdateData = {
      ...req.body
    }
    const resultUpdate = await Task.findOneAndUpdate(
      { $and: [{ _id: taskId }, { creator: creatorId }] },
      { $set: UpdateData },
      {
        new: true
      }
    )
    // console.log(resultUpdate)

    res.send({
      message: 'update success',
      data: resultUpdate
    })
  }
}
exports.Delete_Task = async (req, res) => {
  const creatorId = req.params.userId
  const taskId = req.params.taskId

  // console.log(req.auth)
  try {
    const foundTask = await Task.findOneAndRemove({
      $and: [{ _id: taskId }, { creator: creatorId }]
    })
    const getTask = await Task.find({ creator: creatorId }).populate(
      'creator',
      'userName role'
    )
    if (req.auth.role == process.env.R) {
      console.log(req.auth)
      const getAllTask = await Task.find().populate('creator', 'userName role')
      return res.send({
        message: 'delete success',
        data: getAllTask
      })
    }
    if (foundTask === null) {
      return res.send({
        message: 'delete fail cause data not there'
      })
    }

    return res.send({
      message: 'delete success',
      data: getTask
    })
  } catch (error) {
    return res.status(404).send({
      message: 'delete fail'
    })
  }
}
