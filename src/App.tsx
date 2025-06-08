import ChatWidget from './components/ChatWidget'

function App() {
  return (
    <main className="main-container">
      {/* Background Image */}
      <div className="background-image">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M.png-3oBkc9IHYGeSh1CllBokfGWMzbfFMw.jpeg"
          alt="Cinematic portrait with warm tones"
        />
        {/* Subtle overlay to enhance text visibility */}
        <div className="background-overlay"></div>
      </div>

      {/* Text Content */}
      <div className="content">
        <div className="container">
          <h1>Hello to easy conversation.</h1>
        </div>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </main>
  )
}

export default App
