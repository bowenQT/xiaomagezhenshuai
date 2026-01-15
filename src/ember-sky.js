/**
 * 余烬星空 (Ember Sky)
 * 粒子交互 - 每个粒子代表一封刚刚被"烧掉"的信
 */

import { supabase } from './supabase.js';

// 情绪标签映射
const EMOTION_LABELS = {
    release: '释怀',
    miss: '思念',
    regret: '遗憾',
    gratitude: '感谢',
    apology: '道歉',
    love: '爱意',
    anger: '释放'
};

// 情绪颜色映射
const EMOTION_COLORS = {
    release: { hue: 45, saturation: 100 },    // 金色
    miss: { hue: 220, saturation: 70 },       // 蓝色
    regret: { hue: 280, saturation: 60 },     // 紫色
    gratitude: { hue: 120, saturation: 50 },  // 绿色
    apology: { hue: 30, saturation: 80 },     // 橙色
    love: { hue: 350, saturation: 80 },       // 红色
    anger: { hue: 0, saturation: 90 }         // 深红
};

export class EmberSky {
    constructor(canvas, tooltipElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tooltip = tooltipElement;
        this.embers = [];
        this.recentLetters = [];
        this.activeEmber = null;

        this.resize();
        this.init();

        window.addEventListener('resize', () => this.resize());
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('click', (e) => this.handleClick(e));
        canvas.addEventListener('mouseleave', () => this.hideTooltip());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async init() {
        // Load recent letters
        try {
            this.recentLetters = await supabase.getRecentLetters(30);
            this.createEmbers();
        } catch (error) {
            console.warn('Failed to load letters, using demo data:', error);
            this.createDemoEmbers();
        }

        // Subscribe to realtime updates
        try {
            this.unsubscribe = supabase.subscribeToLetters((letter) => {
                this.addNewEmber(letter);
            });
        } catch (error) {
            console.warn('Realtime subscription failed:', error);
        }

        this.animate();
    }

    createEmbers() {
        this.embers = this.recentLetters.map((letter, i) => this.createEmber(letter, i));
    }

    createDemoEmbers() {
        const demoLetters = [
            { recipient: '前任', emotion: 'release', created_at: new Date().toISOString() },
            { recipient: '已故的姥姥', emotion: 'miss', created_at: new Date().toISOString() },
            { recipient: '暗恋的人', emotion: 'regret', created_at: new Date().toISOString() },
            { recipient: '妈妈', emotion: 'gratitude', created_at: new Date().toISOString() },
            { recipient: '曾经的朋友', emotion: 'apology', created_at: new Date().toISOString() }
        ];
        this.embers = demoLetters.map((letter, i) => this.createEmber(letter, i));
    }

    createEmber(letter, index) {
        const emotion = letter.emotion || 'release';
        const color = EMOTION_COLORS[emotion] || EMOTION_COLORS.release;
        const age = (Date.now() - new Date(letter.created_at).getTime()) / 1000 / 60; // 分钟

        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: -Math.random() * 0.2 - 0.1,
            size: Math.random() * 4 + 2,
            life: Math.max(0.3, 1 - age / 60), // 1小时内逐渐变暗
            hue: color.hue,
            saturation: color.saturation,
            letter: letter,
            pulsePhase: Math.random() * Math.PI * 2
        };
    }

    addNewEmber(letter) {
        // 新信件从底部飞入
        const ember = this.createEmber(letter, this.embers.length);
        ember.y = this.canvas.height + 20;
        ember.vy = -Math.random() * 2 - 1;
        ember.life = 1;
        ember.isNew = true;

        this.embers.push(ember);

        // 保持 embers 数量合理
        if (this.embers.length > 50) {
            this.embers.shift();
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 检查是否悬停在某个 ember 上
        this.activeEmber = null;
        for (const ember of this.embers) {
            const dist = Math.sqrt((ember.x - x) ** 2 + (ember.y - y) ** 2);
            if (dist < ember.size * 3) {
                this.activeEmber = ember;
                this.showTooltip(ember, e.clientX, e.clientY);
                this.canvas.style.cursor = 'pointer';
                return;
            }
        }

        this.hideTooltip();
        this.canvas.style.cursor = 'default';
    }

    handleClick(e) {
        if (this.activeEmber) {
            // 可以扩展为显示更多信息
            console.log('Clicked ember:', this.activeEmber.letter);
        }
    }

    showTooltip(ember, x, y) {
        if (!this.tooltip) return;

        const letter = ember.letter;
        const emotionLabel = EMOTION_LABELS[letter.emotion] || '释怀';
        const recipient = letter.recipient || '某人';

        this.tooltip.innerHTML = `
      <div class="ember-tooltip-content">
        <p>刚刚，有人寄出了一封给</p>
        <p><strong>【${recipient}】</strong>的信</p>
        <p>心情是【<span class="emotion-tag">${emotionLabel}</span>】</p>
      </div>
    `;

        this.tooltip.style.left = `${x + 15}px`;
        this.tooltip.style.top = `${y + 15}px`;
        this.tooltip.classList.add('visible');
    }

    hideTooltip() {
        if (!this.tooltip) return;
        this.tooltip.classList.remove('visible');
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const ember of this.embers) {
            // 更新位置
            ember.x += ember.vx;
            ember.y += ember.vy;
            ember.pulsePhase += 0.05;

            // 边界处理
            if (ember.x < 0) ember.x = this.canvas.width;
            if (ember.x > this.canvas.width) ember.x = 0;
            if (ember.y < 0) ember.y = this.canvas.height;

            // 新信件的上升动画
            if (ember.isNew && ember.vy < -0.5) {
                ember.vy *= 0.98;
                if (ember.vy > -0.3) ember.isNew = false;
            }

            // 绘制
            const pulse = Math.sin(ember.pulsePhase) * 0.2 + 0.8;
            const size = ember.size * (ember === this.activeEmber ? 1.5 : 1);
            const alpha = ember.life * pulse;

            const gradient = this.ctx.createRadialGradient(
                ember.x, ember.y, 0,
                ember.x, ember.y, size * 2
            );

            gradient.addColorStop(0, `hsla(${ember.hue}, ${ember.saturation}%, 70%, ${alpha})`);
            gradient.addColorStop(0.5, `hsla(${ember.hue}, ${ember.saturation}%, 50%, ${alpha * 0.6})`);
            gradient.addColorStop(1, `hsla(${ember.hue}, ${ember.saturation}%, 30%, 0)`);

            this.ctx.beginPath();
            this.ctx.arc(ember.x, ember.y, size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // 高亮效果
            if (ember === this.activeEmber) {
                this.ctx.beginPath();
                this.ctx.arc(ember.x, ember.y, size * 4, 0, Math.PI * 2);
                this.ctx.strokeStyle = `hsla(${ember.hue}, ${ember.saturation}%, 70%, 0.3)`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }
}

export default EmberSky;
