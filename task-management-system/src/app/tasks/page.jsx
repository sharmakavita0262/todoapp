"use client"
import { useEffect, useState, useRef } from "react"
import { axiosClient } from "@/helper/helper"
import { TASKS, USERS, TASK_ASSIGN, LOGOUT } from "@/helper/routes"
import { toast } from "react-toastify"
import { Plus, Edit, Trash2, UserCheck, FileText, Calendar, User, Zap, Star, Circle, Upload, X, EyeIcon, TrendingUp } from "lucide-react"
import "./tasks.css"
import { deleteCookie } from "cookies-next"
import { useRouter } from "next/navigation"

function Page() {
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({})
  const [tasks, setTasks] = useState([])
  const [taskLoading, setTaskLoading] = useState(false)
  const [isloading, setIsloading] = useState(false)
  const [userId, setUserId] = useState("")
  const [taskId, setTaskId] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [modal, setModal] = useState()
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingFiles, setExistingFiles] = useState([])
  const [filesToRemove, setFilesToRemove] = useState([])
  const [fieldValidation, setFieldValidation] = useState({
    title: "",
    description: "",
    priority: "",
    deadline: "",
  })
  const Priority = ["High", "Medium ", "Low"]
    let router = useRouter();

  const fileInputRef = useRef(null)

  const handleInput = (e) => {
    const fieldName = e.target.name
    const fieldValue = e.target.value

    if (fieldName === "title") {
      if (!fieldValue) {
        setFieldValidation((prev) => ({
          ...prev,
          title: "Title is required"
        }))
      } else {
        setFieldValidation((prev) => ({
          ...prev,
          title: ""
        }))
      }
    } else if (fieldName === "priority") {
      if (!fieldValue) {
        setFieldValidation((prev) => ({
          ...prev,
          priority: "Priority is required"
        }))
      } else {
        setFieldValidation((prev) => ({
          ...prev,
          priority: ""
        }))
      }
    } else if (fieldName === "deadline") {
      if (!fieldValue) {
        setFieldValidation((prev) => ({
          ...prev,
          deadline: "Deadline is required"
        }))
      } else {
        setFieldValidation((prev) => ({
          ...prev,
          deadline: ""
        }))
      }
    } 
    else if (fieldName === "description") {
      if (!fieldValue) {
        setFieldValidation((prev) => ({
          ...prev,
          description: "Description is required"
        }))
      } else {
        setFieldValidation((prev) => ({
          ...prev,
          description: ""
        }))
      }
    }

    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue,
    }))
  }

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files)
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
  }

  const handleRemoveExistingFile = (fileId) => {
    setExistingFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId))
    setFilesToRemove((prevFilesToRemove) => [...prevFilesToRemove, fileId])
  }

  const handleRemoveNewFile = (fileName) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName))
    if (fileInputRef.current && selectedFiles.length === 1 && selectedFiles[0].name === fileName) {
      fileInputRef.current.value = ""
    }
  }

  const priorityMap = {
    1: "high",
    2: "medium",
    3: "low",
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <Zap size={16} />
      case "medium":
        return <Star size={16} />
      default:
        return <Circle size={16} />
    }
  }

  const getUsers = async () => {
    const response = await axiosClient().get(USERS)
    if (response?.status === 200) {      
      setUsers(response?.data?.data.filter(data=> data.id !== userId))
    }
  }

  const resetFormAndFiles = () => {
    setFormData({})
    setSelectedFiles([])
    setExistingFiles([])
    setFilesToRemove([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const addTask = async () => {
    const dataToSend = new FormData()

    for (const key in formData) {
      if (formData[key] !== undefined && formData[key] !== null) {
        dataToSend.append(key, formData[key])
      }
    }

    selectedFiles.forEach((file) => {
      dataToSend.append("task_files[]", file)
    })

    if(!formData.title || !formData.priority || !formData.deadline) {
      setFieldValidation((prev)=> ({
        ...prev,
        title: !formData.title ? "Title is required" : "",
        priority: !formData.priority ? "Priority is required" : "",
        deadline: !formData.deadline ? "Deadline date is required" : "",
        description: !formData.description ? "Description is required" : "",
      }))
      return;
    }


    try {
      const response = await axiosClient().post(TASKS, dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setModal(null)

      if (response?.status === 200) {
        toast.success("Task is created successfully.")
        getTasks()
        resetFormAndFiles()
      
      } else {
        toast.error(response?.data?.message || "Task creation failed.")
      }
    } catch (error) {
      if(Object.keys(error?.response?.data?.errors ?? {})?.length) {
        
        toast(<FieldValidation errors={error?.response?.data?.errors} />, {
          type: "error",
          autoClose: "3000"
        })
      } else {
      console.error("Error updating task:", error?.response)
      toast.error("An error occurred while updating the task.")
      }
    }
  }

  const FieldValidation = ({errors})=> {
    return (
      <ul>
        {
           Object.keys(errors).map(data=> (
            <li ><b>{`${errors?.[data]?.[0]}`}</b></li>
           ))
        }
      </ul>
    )
  }

  const editTask = async () => {
    const dataToSend = new FormData()

    for (const key in formData) {
      if (formData[key] !== undefined && formData[key] !== null) {
        dataToSend.append(key, formData[key])
      }
    }

    selectedFiles.forEach((file) => {
      dataToSend.append("task_files[]", file)
    })

    filesToRemove.forEach((fileId) => {
      dataToSend.append("files_to_remove[]", fileId)
    })

    dataToSend.append("_method", "PUT");

    if(!formData.title || !formData.priority || !formData.deadline) {
      setFieldValidation((prev)=> ({
        ...prev,
        title: !formData.title ? "Title is required" : "",
        priority: !formData.priority ? "Priority is required" : "",
        deadline: !formData.deadline ? "Deadline date is required" : "",
        description: !formData.description ? "Description is required" : "",
      }))
      return;
    }

    try {
      const response = await axiosClient().post(`${TASKS}/${taskId}`, dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      setModal(null)

      if (response?.status === 200) {
        toast.success(response?.data?.message)
        getTasks()
        resetFormAndFiles()
      } else {
        toast.error(response?.data?.message || "Task update failed.")
      }
    } catch (error) {
      if(Object.keys(error?.response?.data?.errors ?? {})?.length) {
        
        toast(<FieldValidation errors={error?.response?.data?.errors} />, {
          type: "error",
          autoClose: "3000"
        })
      } else {
      console.error("Error updating task:", error?.response)
      toast.error("An error occurred while updating the task.")
      }
        
    
    }
  }

  const getTasks = async () => {
    try {
      setTaskLoading(true)
      const response = await axiosClient().get(TASKS)
    if (response?.status === 200) {
      setTasks(response?.data?.data)
    }
     setTaskLoading(false)
    } catch (error) {
       setTaskLoading(false)
      toast.error('Error in loading task list')
    }
    
  }

  const removeTask = async (id) => {
    const response = await axiosClient().delete(TASKS + "/" + id)
    if (response?.status === 200) {
      toast.success(response?.data?.message)
      getTasks()
    }
  }

  const getFileIcon = (fileName) => {
    return <FileText size={20} />
  }

  const getModalBody = () => {
    if (modal === "assign") {
      return assignModal()
    } else if (modal === "delete") {
      return deleteModal()
    } else if (modal === "newTask") {
      return newTaskModal()
    } else if (modal === "editTask") {
      return editTaskModal()
    } else if(modal === "viewTask") {
        return viewTask()
    }
  }

  const deleteModal = () => {
    return (
      <div className="tasks-modal-header">
        <div className="tasks-modal-icon delete">
          <Trash2 size={32} />
        </div>
        <h3 className="tasks-modal-title delete">Confirm Delete?</h3>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>This action cannot be undone.</p>
        <div className="tasks-modal-actions">
          <button
            className="btn-gradient-danger"
            onClick={(e) => {
              e.preventDefault()
              setDeleteConfirm(true)
            }}
          >
            Delete
          </button>
          <button
            className="btn-glass"
            onClick={(e) => {
              e.preventDefault()
              setDeleteConfirm(false)
              setModal(null)
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const assignModal = () => {
    return (
      <div>
        <div className="tasks-modal-header">
          <div className="tasks-modal-icon assign">
            <UserCheck size={32} />
          </div>
          <h3 className="tasks-modal-title assign">Assign Task</h3>
        </div>
        <form
          className="tasks-modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            assignTask()
          }}
        >
          <div>
            <label className="form-label">Select User</label>
            <select className="form-input" onChange={(e) => setUserId(e.target.value)}>
              <option value="">Select User</option>
              {users.map((value, i) => (
                <option key={i} value={value.id}>
                  {value?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="tasks-modal-actions">
            <button type="submit" className="btn-gradient-primary">
              Submit
            </button>
            <button type="button" className="btn-glass" onClick={() => setModal(null)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  const newTaskModal = () => {
    return (
      <div>
        <div className="tasks-modal-header">
          
          <h3 className="tasks-modal-title new">New Task</h3>
        </div>
        <form
          className="tasks-modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            addTask()
          }}
        >
          <div>
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Title"
              name="title"
              onChange={handleInput}
              value={formData.title || ""}
            />
            {fieldValidation.title ? <span className="error-message">{fieldValidation.title}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Description *</label>
            <textarea
              className="form-input"
              placeholder="Enter Description"
              name="description"
              rows="3"
              onChange={handleInput}
              value={formData.description || ""}
            />
             {fieldValidation.description ? <span className="error-message">{fieldValidation.description}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Deadline *</label>
            <input
              type="date"
              className="form-input"
              name="deadline"
              onChange={handleInput}
              value={formData.deadline || ""}
            />
            {fieldValidation.deadline ? <span className="error-message">{fieldValidation.deadline}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Task Priority *</label>
            <select className="form-input" name="priority" onChange={handleInput} value={formData.priority || ""}>
              <option value="">Select Priority</option>
              {Priority.map((value, i) => (
                <option key={i} value={i + 1}>
                  {value}
                </option>
              ))}
            </select>
               {fieldValidation.priority ? <span className="error-message">{fieldValidation.priority}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Upload Files</label>
            <div style={{ position: "relative" }}>
              <input type="file" onChange={handleFileUpload} multiple className="form-input" ref={fileInputRef} />
              <Upload
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
                size={20}
              />
            </div>
            {selectedFiles.length > 0 && (
              <div className="tasks-file-list">
                <h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>New Files to Upload:</h6>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="tasks-file-item">
                    <div className="tasks-file-info">
                      {getFileIcon(file.name)}
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>{file.name}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveNewFile(file.name)} className="tasks-file-remove">
                      <X size={16} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="tasks-modal-actions">
            <button type="submit" className="btn-gradient-primary">
              Submit
            </button>
            <button
              type="button"
              className="btn-glass"
              onClick={() => {
                resetFormAndFiles()
                setModal(null)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

  const editTaskModal = () => {
    return (
      <div>
        <div className="tasks-modal-header">
         
          <h3 className="tasks-modal-title edit">Edit Task</h3>
        </div>
        <form
          className="tasks-modal-form"
          onSubmit={(e) => {
            e.preventDefault()
            editTask()
          }}
        >
          <div>
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Title"
              name="title"
              onChange={handleInput}
              value={formData.title || ""}
            />
             {fieldValidation.title ? <span className="error-message">{fieldValidation.title}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Description *</label>
            <textarea
              className="form-input"
              placeholder="Enter Description"
              name="description"
              rows="3"
              onChange={handleInput}
              value={formData.description || ""}
            />
            {fieldValidation.description ? <span className="error-message">{fieldValidation.description}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Deadline *</label>
            <input
              type="date"
              className="form-input"
              name="deadline"
              onChange={handleInput}
              value={formData.deadline || ""}
            />
              {fieldValidation.deadline ? <span className="error-message">{fieldValidation.deadline}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Task Priority *</label>
            <select className="form-input" name="priority" onChange={handleInput} value={formData.priority || ""}>
              <option value="">Select Priority</option>
              {Priority.map((value, i) => (
                <option key={i} value={i + 1}>
                  {value}
                </option>
              ))}
            </select>
               {fieldValidation.priority ? <span className="error-message">{fieldValidation.priority}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Upload New Files</label>
            <div style={{ position: "relative" }}>
              <input type="file" onChange={handleFileUpload} multiple className="form-input" ref={fileInputRef} />
              <Upload
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
                size={20}
              />
            </div>
            {existingFiles.length > 0 && (
              <div className="tasks-file-list">
                <h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Existing Files:</h6>
                {existingFiles.map((file) => (
                  <div key={file.id} className="tasks-file-item" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
                    <div className="tasks-file-info">
                      {getFileIcon(file.original_name)}
                      <a
                        href={`${process.env.NEXT_PUBLIC_SERVER_URL}${file.stored_path}`}
                        target="_blank"
                        style={{ fontSize: "0.875rem", color: "#8b5cf6", textDecoration: "none" }}
                        rel="noreferrer"
                      >
                        {file.original_name}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingFile(file.id)}
                      className="tasks-file-remove"
                    >
                      <X size={16} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div className="tasks-file-list">
                <h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>New Files to Upload:</h6>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="tasks-file-item">
                    <div className="tasks-file-info">
                      {getFileIcon(file.name)}
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>{file.name}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveNewFile(file.name)} className="tasks-file-remove">
                      <X size={16} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="tasks-modal-actions">
            <button type="submit" className="btn-gradient-secondary">
              Save Changes
            </button>
            <button
              type="button"
              className="btn-glass"
              onClick={() => {
                resetFormAndFiles()
                setModal(null)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )
  }

   const viewTask = () => {
    return (
      <div>
        <div className="tasks-modal-header">
         
          <h3 className="tasks-modal-title edit">Task details</h3>
        </div>
        <form
          className="tasks-modal-form"
        >
          <div>
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Title"
              name="title"
              disabled={true}
              value={formData.title || ""}
            />
             {fieldValidation.title ? <span className="error-message">{fieldValidation.title}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Description *</label>
            <textarea
              className="form-input"
              placeholder="Enter Description"
              name="description"
              rows="3"
              disabled={true}
              value={formData.description || ""}
            />
            {fieldValidation.description ? <span className="error-message">{fieldValidation.description}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Deadline *</label>
            <input
              type="date"
              className="form-input"
              name="deadline"
              disabled={true}
              value={formData.deadline || ""}
            />
              {fieldValidation.deadline ? <span className="error-message">{fieldValidation.deadline}</span> : <></>}
          </div>
          <div>
            <label className="form-label">Task Priority *</label>
            <select className="form-input" name="priority" value={formData.priority || ""} disabled={true}>
              <option value="">Select Priority</option>
              {Priority.map((value, i) => (
                <option key={i} value={i + 1}>
                  {value}
                </option>
              ))}
            </select>
               {fieldValidation.priority ? <span className="error-message">{fieldValidation.priority}</span> : <></>}
          </div>
          <div>
            {existingFiles.length > 0 && (
              <div className="tasks-file-list">
                <h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>Existing Files:</h6>
                {existingFiles.map((file) => (
                  <div key={file.id} className="tasks-file-item" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
                    <div className="tasks-file-info">
                      {getFileIcon(file.original_name)}
                      <a
                        href={`${process.env.NEXT_PUBLIC_SERVER_URL}${file.stored_path}`}
                        target="_blank"
                        style={{ fontSize: "0.875rem", color: "#8b5cf6", textDecoration: "none" }}
                        rel="noreferrer"
                      >
                        {file.original_name}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedFiles.length > 0 && (
              <div className="tasks-file-list">
                <h6 style={{ fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>New Files to Upload:</h6>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="tasks-file-item">
                    <div className="tasks-file-info">
                      {getFileIcon(file.name)}
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>{file.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    )
  }

  if (deleteConfirm) {
    removeTask(taskId)
    setDeleteConfirm(false)
    setModal(null)
  }

  useEffect(() => {
    getUsers()
    getTasks()
  }, [])

   let logOut = async () => {
    setIsloading(true)
    try {
      let res = await axiosClient().post(LOGOUT);
      if (res.data?.success == true) {
        deleteCookie('user');
        deleteCookie('token');
        router.replace('/');
      } else {
        toast.error(res.data?.message || 'Something went wrong');
      }
    } catch (error) {
       toast.error('Error in logout');
    } finally {
      setIsloading(false)
    }
  };

  return (
    <div className="tasks-container">
      <div className="bg-decorative"></div>

      {/* Header */}
      <div className="tasks-header">
        <div>
          <h1 className="tasks-title">All Tasks</h1>
          <p className="tasks-subtitle">Manage and track your team's tasks</p>
        </div>
        <div className="tasks-add-wrap">
        <button
          className="tasks-add-btn"
          onClick={() => {
            setModal("newTask")
            resetFormAndFiles()
          }}
        >
          <Plus size={20} />
          <span>Add Task</span>
        </button>
     
        <button
        className="tasks-add-btn"
          href="javascript:void(0);"
          onClick={() => {
            logOut();
          }}
          disabled={isloading}
        >
          <i className="ti ti-logout ti-sm"></i>
          <span className="align-middle">Log Out</span>
        </button>
        </div>
      
      </div>

      {/* Tasks Table */}
      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead className="tasks-table-header">
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Created By</th>
              <th>Priority</th>
              <th>Attachments</th>
              <th>Deadline</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              taskLoading ?(
                <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: "20px" }}>Loading....</td>
            </tr>
              ) : !tasks.length ? (
                <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: "20px" }}>No task created</td>
            </tr>
              ) : tasks?.map((task, key) => {
              const attachments = JSON.parse(task?.attachments || "[]")
             const priority = priorityMap[task?.priority] || "low"

              return (
                <tr key={task.id || key} className="tasks-table-row">
                  <td className="tasks-table-cell">{key + 1}</td>
                  <td className="tasks-table-cell">
                    <div style={{ fontWeight: 600, color: "#1f2937" }}>{task?.title}</div>
                  </td>
                  <td className="tasks-table-cell">
                    <div className="tasks-user-info">
                      <div className="tasks-user-avatar created">
                        <User size={16} />
                      </div>
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>{task?.assigned_by?.name}</span>
                    </div>
                  </td>
                  <td className="tasks-table-cell">
                    <div className={`tasks-priority-badge ${priority}`}>
                      {getPriorityIcon(priority)}
                      <span>{priority}</span>
                    </div>
                  </td>
                  <td className="tasks-table-cell">
                    <div>
                      {attachments?.length ? attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={`${process.env.NEXT_PUBLIC_SERVER_URL}${attachment.stored_path}`}
                          target="_blank"
                          className="tasks-attachment"
                          rel="noreferrer"
                        >
                          <FileText size={16} />
                          {attachment.original_name}
                        </a>
                      )): <>N/A</>}
                    </div>
                  </td>
                  <td className="tasks-table-cell">
                    <div className="tasks-deadline">
                      <Calendar size={16} />
                      <span>{task?.deadline}</span>
                    </div>
                  </td>
                  <td className="tasks-table-cell">
                    <div className="tasks-actions">
                      <button
                        className="tasks-action-btn edit"
                        onClick={() => {
                          setModal("editTask")
                          setTaskId(task?.id)
                          setFormData({
                            title: task?.title,
                            description: task?.description,
                            deadline: task?.deadline?.slice(0, 16),
                            priority: task?.priority || "",
                          })
                          setExistingFiles(attachments)
                          setSelectedFiles([])
                          setFilesToRemove([])
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="tasks-action-btn delete"
                        onClick={() => {
                          setModal("delete")
                          setTaskId(task?.id)
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="tasks-action-btn"
                        onClick={() => {
                          setModal("viewTask")
                          setTaskId(task?.id)
                          setFormData({
                            title: task?.title,
                            description: task?.description,
                            deadline: task?.deadline?.slice(0, 16),
                            priority: task?.priority || "",
                          })
                          setExistingFiles(attachments)
                          setSelectedFiles([])
                          setFilesToRemove([])
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                      >
                        <EyeIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="tasks-modal" onClick={() => setModal(null)}>
          <div className="tasks-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="tasks-modal-close"
              onClick={() => {
                resetFormAndFiles()
                setModal(null)
              }}
            >
              <X size={20} />
            </button>
            {getModalBody()}
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
