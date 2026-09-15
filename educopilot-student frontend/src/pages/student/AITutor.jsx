import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, Sparkles, History, Plus, Paperclip, X, FileText } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import ChatMessage from '../../components/student/ChatMessage'
import { fetchCourses } from '../../services/courseService'
import { askTutor, getSuggestedQuestions, getConversationHistory } from '../../services/aiService'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

export default function AITutor() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const scrollRef = useRef(null)

  const [courses, setCourses] = useState([])
  useEffect(() => {
    fetchCourses().then((items) => {
      setCourses(items)
      if (!courseId && items[0]) navigate(`/student/tutor/${items[0].id}`, { replace: true })
    })
  }, [courseId, navigate])
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      confidence: 'grounded',
      sections: [
        {
          heading: 'Hi there 👋',
          body: 'AI Tutor is connected to the backend and will answer from your professor\'s published course material once the AI service is available.',
        },
      ],
      sources: [],
    },
  ])
  const [input, setInput] = useState('')
  const [asking, setAsking] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const fileInputRef = useRef(null)
  const suggestedQuestions = getSuggestedQuestions()
  const conversationHistory = getConversationHistory()

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (!file) return
    // Keep the real File object (not just its name) so that once a backend
    // is connected, aiService.askTutor can send it as multipart/form-data —
    // the selected file will be sent to the AI backend when connected.
    setAttachment(file)
    toast.success(`Attached "${file.name}" — I'll factor it into my next answer.`)
    event.target.value = ''
  }

  async function handleAsk(question) {
    const trimmed = question.trim()
    if (!trimmed || asking) return
    setMessages((current) => [...current, { role: 'user', content: trimmed }])
    setInput('')
    setAsking(true)
    try {
      const response = await askTutor({ courseId, question: trimmed, attachment })
      setMessages((current) => [...current, { role: 'assistant', ...response }])
    } catch {
      toast.error('The tutor is unavailable right now. Please try again.')
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col lg:h-[calc(100vh-6.5rem)]">
      <PageHeader
        title="AI Tutor"
        subtitle="Grounded answers from your course materials, with citations."
        actions={
          <>
            <Select
              value={courseId}
              onChange={(e) => navigate(`/student/tutor/${e.target.value}`)}
              options={courses.map((c) => ({ value: c.id, label: c.code }))}
              className="w-32"
            />
            <Button variant="secondary" icon={History} onClick={() => setHistoryOpen((v) => !v)}>
              History
            </Button>
          </>
        }
        className="mb-4"
      />

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-ink-200 bg-white">
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4 scrollbar-thin sm:p-6">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {asking && (
              <div className="flex items-center gap-2 text-sm text-ink-400">
                <Sparkles className="size-4 animate-pulse text-teal-500" />
                Thinking through your course material...
              </div>
            )}
          </div>

          <div className="border-t border-ink-100 p-3 sm:p-4">
            {attachment && (
              <div className="mb-2.5 flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800">
                <FileText className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{attachment.name}</span>
                <span className="text-teal-500">{(attachment.size / (1024 * 1024)).toFixed(2)} MB</span>
                <button
                  onClick={() => setAttachment(null)}
                  className="text-teal-500 hover:text-teal-700"
                  aria-label="Remove attachment"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-teal-300 hover:text-teal-700"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAsk(input)
              }}
              className="flex items-end gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-ink-500 transition-colors hover:border-teal-300 hover:text-teal-600"
                aria-label="Attach a document to ask about"
                title="Attach a document (PDF, notes, image)"
              >
                <Paperclip className="size-4" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAsk(input)
                  }
                }}
                rows={1}
                placeholder={attachment ? `Ask something about "${attachment.name}"...` : 'Ask about a topic in your course materials...'}
                className="max-h-32 flex-1 resize-none rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-100"
              />
              <Button type="submit" icon={Send} loading={asking} disabled={!input.trim()} aria-label="Send" />
            </form>
          </div>
        </div>

        {historyOpen && (
          <div className="hidden w-64 shrink-0 rounded-2xl border border-ink-200 bg-white p-4 lg:block">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-800">Conversations</p>
              <button className="text-teal-600 hover:text-teal-700" aria-label="New conversation">
                <Plus className="size-4" />
              </button>
            </div>
            <div className="space-y-1">
              {conversationHistory.map((item) => (
                <button
                  key={item.id}
                  className="w-full rounded-lg px-2.5 py-2 text-left text-sm text-ink-600 transition-colors hover:bg-sand-50"
                >
                  <p className="truncate">{item.title}</p>
                  <p className="text-xs text-ink-400">{formatDate(item.updatedAt)}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
