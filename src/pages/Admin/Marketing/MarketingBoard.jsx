export default function MarketingBoard({
  tasks, tasksLoading, salespeople,
  selectedTask, setSelectedTask,
  isNewTaskOpen, setIsNewTaskOpen,
  dragOverCol, setDragOverCol,
  newTitle, setNewTitle,
  newDesc, setNewDesc,
  newAssigneeIds, setNewAssigneeIds,
  newCommentText, setNewCommentText,
  newAttachmentName, setNewAttachmentName,
  newAttachmentUrl, setNewAttachmentUrl,
  handleCreateTask, handleUpdateStatus, handleAddComment,
  handleAddAttachment, handleSaveTaskDetails, handleDeleteTask,
  handleDragStart, handleDrop, toggleAssignee,
}) {
  function renderTaskCard(task) {
    const cardAssignees = salespeople.filter(sp => (task.assignee_ids || []).includes(sp.id))
    return (
      <div
        key={task.id}
        className="kanban-card"
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        onClick={() => setSelectedTask(task)}
      >
        <h4 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.4 }}>
          {task.title}
        </h4>
        
        {task.description && (
          <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.78rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', color: '#475569' }}>
            {(task.attachments || []).length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                {(task.attachments || []).length}
              </span>
            )}
            {(task.comments || []).length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                {(task.comments || []).length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', paddingLeft: '8px' }}>
            {cardAssignees.slice(0, 3).map((sp, idx) => {
              const namePart = sp.name || sp.email.split('@')[0]
              const initials = namePart.substring(0, 2).toUpperCase()
              return (
                <div key={sp.id} className="avatar-circle" title={namePart}>
                  {initials}
                </div>
              )
            })}
            {cardAssignees.length > 3 && (
              <div className="avatar-circle" style={{ background: '#334155' }}>
                +{cardAssignees.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Board Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'white' }}>
            Marketing Task Board
          </h2>
          <p style={{ color: '#64748B', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Collaborate on tasks, attach documents, and assign salespeople</p>
        </div>
        <button
          onClick={() => setIsNewTaskOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #d1bbfb, #db77b7)',
            color: 'white', border: 'none', borderRadius: '12px',
            padding: '12px 24px', fontWeight: 700, fontSize: '0.9rem',
            cursor: 'pointer', boxShadow: '0 4px 15px rgba(209, 187, 251, 0.3)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Task
        </button>
      </div>

      {tasksLoading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>Loading Trello board...</div>
      ) : (
        <div className="kanban-board">
          {/* TO DO */}
          <div
            className={`kanban-column ${dragOverCol === 'todo' ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol('todo') }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, 'todo')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff4a7d' }}></span>
                To Do
              </span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                {tasks.filter(t => t.status === 'todo').length}
              </span>
            </div>
            {tasks.filter(t => t.status === 'todo').map(task => renderTaskCard(task))}
          </div>

          {/* IN PROGRESS */}
          <div
            className={`kanban-column ${dragOverCol === 'in_progress' ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol('in_progress') }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, 'in_progress')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></span>
                In Progress
              </span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                {tasks.filter(t => t.status === 'in_progress').length}
              </span>
            </div>
            {tasks.filter(t => t.status === 'in_progress').map(task => renderTaskCard(task))}
          </div>

          {/* DONE */}
          <div
            className={`kanban-column ${dragOverCol === 'done' ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol('done') }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, 'done')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                Done
              </span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>
                {tasks.filter(t => t.status === 'done').length}
              </span>
            </div>
            {tasks.filter(t => t.status === 'done').map(task => renderTaskCard(task))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE TASK */}
      {isNewTaskOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <form
            onSubmit={handleCreateTask}
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)' }}
          >
            <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '1.3rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>Create Marketing Task</h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Title</label>
              <input
                type="text" required value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Design new landing page graphics"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description</label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Details about the task..."
                style={{ width: '100%', height: '100px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Assign Team Members</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                {salespeople.map(sp => {
                  const isSelected = newAssigneeIds.includes(sp.id)
                  return (
                    <button
                      key={sp.id} type="button"
                      onClick={() => setNewAssigneeIds(toggleAssignee(sp.id, newAssigneeIds))}
                      style={{
                        padding: '8px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: isSelected ? 'rgba(209, 187, 251,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? '#d1bbfb' : 'rgba(255,255,255,0.08)'}`,
                        color: isSelected ? 'white' : '#94a3b8'
                      }}
                    >
                      {sp.name || sp.email.split('@')[0]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button" onClick={() => setIsNewTaskOpen(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg,#d1bbfb,#db77b7)', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: TASK DETAILS */}
      {selectedTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
            width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: selectedTask.status === 'todo' ? 'rgba(255,74,125,0.15)' : selectedTask.status === 'in_progress' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                  color: selectedTask.status === 'todo' ? '#ff4a7d' : selectedTask.status === 'in_progress' ? '#3b82f6' : '#10b981'
                }}>
                  {selectedTask.status.replace('_', ' ')}
                </span>
                <h3 style={{ margin: '8px 0 0 0', color: 'white', fontSize: '1.4rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#64748b', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px', padding: '32px', overflowY: 'auto', flex: 1 }}>
              {/* Left: Description, Attachments, Comments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700 }}>Description</h4>
                  <textarea
                    value={selectedTask.description || ''}
                    onChange={e => handleSaveTaskDetails(selectedTask.id, { description: e.target.value })}
                    placeholder="Add details for this task..."
                    style={{ width: '100%', height: '100px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: '#94a3b8', outline: 'none', resize: 'none', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                    Attachments (Docs &amp; Links)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {(selectedTask.attachments || []).length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>No files or links attached yet.</span>
                    ) : (
                      (selectedTask.attachments || []).map((att, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <a href={att.url} target="_blank" rel="noreferrer" style={{ color: '#c084fc', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            {att.name}
                          </a>
                          <button
                            onClick={() => {
                              const updated = selectedTask.attachments.filter((_, i) => i !== idx)
                              handleSaveTaskDetails(selectedTask.id, { attachments: updated })
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text" placeholder="Doc name (e.g. Brief)" value={newAttachmentName}
                      onChange={e => setNewAttachmentName(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'white', fontSize: '0.8rem', outline: 'none' }}
                    />
                    <input
                      type="text" placeholder="Link/URL" value={newAttachmentUrl}
                      onChange={e => setNewAttachmentUrl(e.target.value)}
                      style={{ flex: 1.5, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: 'white', fontSize: '0.8rem', outline: 'none' }}
                    />
                    <button
                      onClick={() => handleAddAttachment(selectedTask.id)}
                      style={{ padding: '8px 16px', background: 'rgba(209, 187, 251,0.2)', border: '1px solid #d1bbfb', color: '#c084fc', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Attach
                    </button>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: 'white', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Comments / Activity
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '6px', marginBottom: '14px' }}>
                    {(selectedTask.comments || []).length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>No comments left yet.</span>
                    ) : (
                      (selectedTask.comments || []).map(comment => (
                        <div key={comment.id} style={{ background: 'rgba(255,255,255,0.01)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.75rem' }}>{comment.user_name}</span>
                            <span style={{ color: '#475569', fontSize: '0.65rem' }}>{comment.created_at}</span>
                          </div>
                          <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.8rem', lineHeight: '1.4' }}>{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text" placeholder="Write a comment..." value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedTask.id)}
                      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button
                      onClick={() => handleAddComment(selectedTask.id)}
                      style={{ padding: '10px 16px', background: '#d1bbfb', border: 'none', color: 'white', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Status, Assignees, Delete */}
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Task Status</label>
                  <select
                    value={selectedTask.status}
                    onChange={e => handleUpdateStatus(selectedTask.id, e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#64748B', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Assigned People</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {salespeople.map(sp => {
                      const isAssigned = (selectedTask.assignee_ids || []).includes(sp.id)
                      return (
                        <button
                          key={sp.id} type="button"
                          onClick={() => {
                            const updated = toggleAssignee(sp.id, selectedTask.assignee_ids || [])
                            handleSaveTaskDetails(selectedTask.id, { assignee_ids: updated })
                          }}
                          style={{
                            padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                            background: isAssigned ? 'rgba(209, 187, 251,0.12)' : 'transparent',
                            border: `1px solid ${isAssigned ? '#d1bbfb' : 'rgba(255,255,255,0.05)'}`,
                            color: isAssigned ? 'white' : '#64748b',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                        >
                          <span>{sp.name || sp.email.split('@')[0]}</span>
                          {isAssigned && <span style={{ color: '#c084fc', fontSize: '0.8rem' }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                  <button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                      color: '#f87171', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
