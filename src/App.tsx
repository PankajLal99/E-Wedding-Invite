import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ShareBar from './components/ShareBar'
import Countdown from './components/Countdown'
import Story from './components/Story'
import OursNote from './components/OursNote'
import Events from './components/Events'
import Timeline from './components/Timeline'
import Travel from './components/Travel'
import Faq from './components/Faq'
import Blessings from './components/Blessings'
import Footer from './components/Footer'
import MusicToggle from './components/MusicToggle'
import DriftingPetals from './components/decor/DriftingPetals'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ShareBar />
        <Countdown />
        <Story />
        <OursNote />
        <Events />
        <Timeline />
        <Travel />
        <Faq />
        <Blessings />
      </main>
      <Footer />
      <DriftingPetals />
      <MusicToggle />
    </>
  )
}
