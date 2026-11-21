import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import Story from './components/Story'
import OursNote from './components/OursNote'
import Family from './components/Family'
import Events from './components/Events'
import Gallery from './components/Gallery'
import Timeline from './components/Timeline'
import Travel from './components/Travel'
import Faq from './components/Faq'
import Blessings from './components/Blessings'
import Footer from './components/Footer'
import MusicToggle from './components/MusicToggle'
import WhatsAppQuery from './components/WhatsAppQuery'
import DriftingPetals from './components/decor/DriftingPetals'
import Envelope from './components/Envelope'
import { useSite } from './hooks/useSite'

export default function App() {
  const { family } = useSite()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Countdown />
        <Events />
        <Timeline />
        <Family />
        <Story />
        <OursNote />
        <Gallery />
        <Travel />
        {family === 'groom' && <Faq />}
        <Blessings />
      </main>
      <Footer />
      <DriftingPetals />
      <WhatsAppQuery />
      <MusicToggle />
      <Envelope />
    </>
  )
}
