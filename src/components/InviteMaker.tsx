import { useMemo, useState } from 'react'
import { currentSiteUrl } from '../config/sides'
import {
  encodeInvite,
  inviteBook,
  inviteUrl,
  whatsappInviteText,
  formatGuestLine,
} from '../utils/invite'
import './InviteMaker.css'

export default function InviteMaker() {
  const [name, setName] = useState('Gunjan Kubde')
  const [saparivar, setSaparivar] = useState(true)
  const [elders, setElders] = useState('')
  const [preset, setPreset] = useState('')

  const elderList = elders
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

  const token = useMemo(() => {
    if (preset && inviteBook[preset]) return preset
    return encodeInvite({
      n: name,
      s: saparivar,
      e: saparivar ? elderList : [],
    })
  }, [name, saparivar, elders, preset, elderList.join('|')])

  const url = inviteUrl(currentSiteUrl(), token)
  const preview = formatGuestLine({
    n: preset && inviteBook[preset] ? inviteBook[preset].name : name,
    s: preset && inviteBook[preset] ? inviteBook[preset].saparivar : saparivar,
    e:
      preset && inviteBook[preset]
        ? inviteBook[preset].elders
        : saparivar
          ? elderList
          : [],
  })

  const wa = `https://wa.me/?text=${encodeURIComponent(
    whatsappInviteText(
      {
        n: preset && inviteBook[preset] ? inviteBook[preset].name : name,
        s: preset && inviteBook[preset] ? inviteBook[preset].saparivar : saparivar,
        e:
          preset && inviteBook[preset]
            ? inviteBook[preset].elders
            : saparivar
              ? elderList
              : [],
      },
      url
    )
  )}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert('Personal invite link copied')
    } catch {
      prompt('Copy link:', url)
    }
  }

  return (
    <section className="invite-maker" id="invite-maker">
      <div className="container">
        <div className="section-ornament">
          <span>✦</span>
        </div>
        <p className="section-kicker">Host tools</p>
        <h2 className="section-title">Create invitation</h2>
        <p className="section-subtitle">
          Create personal links — guest names stay hidden in the URL
        </p>

        <div className="invite-maker__card">
          <label>
            Saved guest
            <select
              value={preset}
              onChange={(e) => {
                const v = e.target.value
                setPreset(v)
                if (v && inviteBook[v]) {
                  setName(inviteBook[v].name)
                  setSaparivar(inviteBook[v].saparivar)
                  setElders((inviteBook[v].elders || []).join(', '))
                }
              }}
            >
              <option value="">Custom</option>
              {Object.entries(inviteBook).map(([code, g]) => (
                <option key={code} value={code}>
                  {g.name} ({code})
                </option>
              ))}
            </select>
          </label>

          <label>
            Guest name
            <input
              value={name}
              onChange={(e) => {
                setPreset('')
                setName(e.target.value)
              }}
              placeholder="Gunjan Kubde"
            />
          </label>

          <fieldset className="invite-maker__family">
            <legend>Invite type</legend>
            <label className="invite-maker__radio">
              <input
                type="radio"
                name="family"
                checked={saparivar}
                onChange={() => {
                  setPreset('')
                  setSaparivar(true)
                }}
              />
              With family
            </label>
            <label className="invite-maker__radio">
              <input
                type="radio"
                name="family"
                checked={!saparivar}
                onChange={() => {
                  setPreset('')
                  setSaparivar(false)
                }}
              />
              Without family
            </label>
          </fieldset>

          {saparivar && (
            <label>
              Elders (comma separated)
              <input
                value={elders}
                onChange={(e) => {
                  setPreset('')
                  setElders(e.target.value)
                }}
                placeholder="Shri Rameshji, Smt Sunita Ji"
              />
            </label>
          )}

          <div className="invite-maker__preview">
            <span>Preview</span>
            <strong>{preview}</strong>
          </div>

          <p className="invite-maker__url">{url}</p>

          <div className="invite-maker__actions">
            <button type="button" className="btn btn-primary" onClick={() => void copy()}>
              Copy link
            </button>
            <a className="btn btn-ghost" href={wa} target="_blank" rel="noopener noreferrer">
              Send on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
