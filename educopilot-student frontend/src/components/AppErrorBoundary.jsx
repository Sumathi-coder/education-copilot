import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('EduCopilot UI error:', error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui' }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#66756d', marginBottom: 10 }}>A page encountered an error. Your saved local data has not been deleted.</p><pre style={{ overflow: 'auto', maxWidth: 560, padding: 12, borderRadius: 8, background: '#f5f6f2', color: '#94362c', textAlign: 'left', fontSize: 12, marginBottom: 18 }}>{this.state.error?.message || String(this.state.error)}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', borderRadius: 8, border: 0, background: '#168f72', color: 'white', cursor: 'pointer' }}>Reload application</button>
        </div>
      </div>
    )
  }
}
