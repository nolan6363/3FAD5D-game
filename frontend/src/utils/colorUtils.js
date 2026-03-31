// Couleur cible : #3FAD5D (logo JEECE)
const TARGET = { r: 63, g: 173, b: 93 }

// Rayon d'échantillonnage : 20% du min(width, height), centré
const SAMPLE_RADIUS_RATIO = 0.20

/**
 * Analyse la couleur dans le petit cercle central d'un canvas.
 * Retourne : moyenne RGB, écart-type moyen, distance colorimétrique, score.
 */
export function analyzeColor(canvas) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const cx = Math.floor(w / 2)
  const cy = Math.floor(h / 2)
  const radius = Math.floor(Math.min(w, h) * SAMPLE_RADIUS_RATIO)

  const x0 = cx - radius
  const y0 = cy - radius
  const size = radius * 2

  const imageData = ctx.getImageData(x0, y0, size, size)
  const data = imageData.data

  // — Passe 1 : calcul de la moyenne RGB —
  let sumR = 0, sumG = 0, sumB = 0, count = 0
  const step = 2

  for (let py = 0; py < size; py += step) {
    for (let px = 0; px < size; px += step) {
      if ((px - radius) ** 2 + (py - radius) ** 2 <= radius ** 2) {
        const idx = (py * size + px) * 4
        sumR += data[idx]
        sumG += data[idx + 1]
        sumB += data[idx + 2]
        count++
      }
    }
  }

  if (count === 0) return null

  const meanR = sumR / count
  const meanG = sumG / count
  const meanB = sumB / count

  // — Passe 2 : calcul de l'écart-type par canal —
  let varR = 0, varG = 0, varB = 0

  for (let py = 0; py < size; py += step) {
    for (let px = 0; px < size; px += step) {
      if ((px - radius) ** 2 + (py - radius) ** 2 <= radius ** 2) {
        const idx = (py * size + px) * 4
        varR += (data[idx]     - meanR) ** 2
        varG += (data[idx + 1] - meanG) ** 2
        varB += (data[idx + 2] - meanB) ** 2
      }
    }
  }

  const stdR = Math.sqrt(varR / count)
  const stdG = Math.sqrt(varG / count)
  const stdB = Math.sqrt(varB / count)
  const avgStd = (stdR + stdG + stdB) / 3

  // — Score —
  const r = Math.round(meanR)
  const g = Math.round(meanG)
  const b = Math.round(meanB)

  const distance = Math.sqrt(
    (r - TARGET.r) ** 2 + (g - TARGET.g) ** 2 + (b - TARGET.b) ** 2
  )

  // Composante couleur : gaussienne centrée sur la cible (sigma=60)
  // → distance=0 : 100, distance=80 : 41, distance=150 : 4, distance=200 : <1
  const SIGMA_DIST = 60
  const colorScore = 100 * Math.exp(-(distance ** 2) / (2 * SIGMA_DIST ** 2))

  // Composante uniformité : gaussienne inversée (sigma=70)
  // → std=0 : 1.0, std=30 : 0.91, std=70 : 0.61, std=120 : 0.22
  const SIGMA_STD = 70
  const uniformityFactor = Math.exp(-(avgStd ** 2) / (2 * SIGMA_STD ** 2))

  const score = Math.round(colorScore * uniformityFactor)

  const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')

  return { r, g, b, hex, score, distance: Math.round(distance), avgStd: Math.round(avgStd) }
}

/**
 * Capture une frame vidéo et retourne le résultat de l'analyse + la dataURL.
 */
export function captureFromVideo(videoEl) {
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.videoWidth
  canvas.height = videoEl.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoEl, 0, 0)

  const result = analyzeColor(canvas)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

  return { ...result, dataUrl }
}

export function scoreMessage(score) {
  if (score >= 88) return 'Perfection absolue ! 🎯'
  if (score >= 70) return 'Très proche de la cible !'
  if (score >= 50) return 'Bonne approximation.'
  if (score >= 30) return 'Peut mieux faire…'
  return 'Loin du compte !'
}

export function scoreColor(score) {
  if (score >= 70) return '#3FAD5D'
  if (score >= 40) return '#f0a500'
  return '#e05252'
}
