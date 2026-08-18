import { useEffect, useRef, useState } from 'react'
import './LiquidEther.css'

export function LiquidEther({
    etherColor = '#7c3aed',
    secondaryColor = '#e11d48',
    coreColor = '#a855f7',
}) {
    const canvasRef = useRef(null)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        let animationFrameId
        let mouseX = -1000
        let mouseY = -1000
        let targetX = -1000
        let targetY = -1000
        let prevX = -1000
        let prevY = -1000
        let activeOpacity = 0

        const ripples = []
        const streakPoints = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener('resize', resize)
        resize()

        const handleMouseMove = (e) => {
            const targetEl = e.target
            // Check if cursor is pointing to an empty space vs cards, text, buttons, forms
            const isInteractive = targetEl.closest(
                'button, a, input, label, form, .glass-auth-card, .auth-info-panel, .auth-form-panel, .depth-card, .landing-topbar, .info-pillars-list, h1, h2, h3, p, span, img'
            )

            const emptySpace = !isInteractive
            setIsActive(emptySpace)

            if (emptySpace) {
                targetX = e.clientX
                targetY = e.clientY

                const dx = targetX - (prevX < 0 ? targetX : prevX)
                const dy = targetY - (prevY < 0 ? targetY : prevY)
                const speed = Math.hypot(dx, dy)

                prevX = targetX
                prevY = targetY

                streakPoints.push({
                    x: targetX,
                    y: targetY,
                    life: 1.0,
                    width: Math.min(38, 16 + speed * 0.3),
                    color: Math.random() > 0.5 ? etherColor : secondaryColor,
                })

                if (speed > 2 || Math.random() > 0.3) {
                    ripples.push({
                        x: targetX + (Math.random() - 0.5) * 20,
                        y: targetY + (Math.random() - 0.5) * 20,
                        radius: 12,
                        maxRadius: 160 + Math.random() * 50,
                        alpha: 0.7,
                        speed: 2.5 + Math.random() * 1.5,
                        color: Math.random() > 0.4 ? etherColor : secondaryColor,
                    })
                }
            }
        }

        window.addEventListener('mousemove', handleMouseMove)

        let time = 0

        const render = () => {
            time += 0.025
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const targetOpacity = isActive ? 1.0 : 0.0
            activeOpacity += (targetOpacity - activeOpacity) * 0.15

            if (activeOpacity > 0.005) {
                ctx.globalCompositeOperation = 'lighter'

                mouseX += (targetX - mouseX) * 0.16
                mouseY += (targetY - mouseY) * 0.16

                // Draw balanced liquid streak trail
                for (let i = streakPoints.length - 1; i >= 0; i--) {
                    const sp = streakPoints[i]
                    sp.life *= 0.93

                    if (sp.life < 0.01) {
                        streakPoints.splice(i, 1)
                        continue
                    }

                    const streakGrad = ctx.createRadialGradient(
                        sp.x, sp.y, 0,
                        sp.x, sp.y, sp.width * sp.life
                    )
                    streakGrad.addColorStop(0, `${coreColor}99`)
                    streakGrad.addColorStop(0.4, `${sp.color}55`)
                    streakGrad.addColorStop(0.75, `${secondaryColor}25`)
                    streakGrad.addColorStop(1, 'rgba(0,0,0,0)')

                    ctx.fillStyle = streakGrad
                    ctx.globalAlpha = sp.life * activeOpacity * 0.6
                    ctx.beginPath()
                    ctx.arc(sp.x, sp.y, sp.width * sp.life, 0, Math.PI * 2)
                    ctx.fill()
                }

                // Draw balanced liquid ether ripples
                for (let i = ripples.length - 1; i >= 0; i--) {
                    const r = ripples[i]
                    r.radius += r.speed
                    r.alpha *= 0.95

                    if (r.alpha < 0.01 || r.radius > r.maxRadius) {
                        ripples.splice(i, 1)
                        continue
                    }

                    const grad = ctx.createRadialGradient(
                        r.x, r.y, r.radius * 0.1,
                        r.x, r.y, r.radius
                    )
                    grad.addColorStop(0, `${r.color}55`)
                    grad.addColorStop(0.4, `${coreColor}22`)
                    grad.addColorStop(0.8, `${r.color}10`)
                    grad.addColorStop(1, 'rgba(0,0,0,0)')

                    ctx.fillStyle = grad
                    ctx.globalAlpha = r.alpha * activeOpacity * 0.7
                    ctx.beginPath()
                    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
                    ctx.fill()
                }

                // Soft liquid ether core glow around active cursor
                if (mouseX > 0 && mouseY > 0 && isActive) {
                    const waveRadius = 140 + Math.sin(time * 3.5) * 25
                    const etherGrad = ctx.createRadialGradient(
                        mouseX, mouseY, 0,
                        mouseX, mouseY, waveRadius
                    )
                    etherGrad.addColorStop(0, `${coreColor}88`)
                    etherGrad.addColorStop(0.35, `${etherColor}44`)
                    etherGrad.addColorStop(0.7, `${secondaryColor}20`)
                    etherGrad.addColorStop(1, 'rgba(0,0,0,0)')

                    ctx.globalAlpha = 0.55 * activeOpacity
                    ctx.fillStyle = etherGrad
                    ctx.beginPath()
                    ctx.arc(mouseX, mouseY, waveRadius, 0, Math.PI * 2)
                    ctx.fill()
                }

                ctx.globalCompositeOperation = 'source-over'
            }

            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [isActive, etherColor, secondaryColor, coreColor])

    return <canvas ref={canvasRef} className="liquid-ether-canvas" />
}
