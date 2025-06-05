class PerformanceAnalyzer {
    constructor(cpu, gpu, game, settings = {}) {
        this.cpu = cpu;
        this.gpu = gpu;
        this.game = game;
        this.settings = {
            resolution: settings.resolution || '1080',
            quality: settings.quality || 'high',
            rayTracing: settings.rayTracing || false,
            dlss: settings.dlss || false,
            ram: settings.ram || 16
        };
    }

    analyzeBottleneck() {
        const cpuScore = this.calculateCpuScore();
        const gpuScore = this.calculateGpuScore();
        const ratio = cpuScore / gpuScore;

        return {
            bottleneck: ratio < 0.85 ? 'cpu' : ratio > 1.15 ? 'gpu' : 'balanced',
            cpuScore,
            gpuScore,
            ratio
        };
    }

    calculateCpuScore() {
        let score = this.cpu.performance;
        
        // Factor in CPU-intensive aspects
        if (this.game.id === 'warzone' || this.game.id === 'cyberpunk2077') {
            score *= 0.9; // These games are CPU heavy
        }

        // RAM impact
        if (this.settings.ram < this.game.requirements.recRam) {
            score *= 0.85;
        }

        return score;
    }

    calculateGpuScore() {
        let score = this.gpu.performance;
        
        // Resolution impact
        const resolutionMultipliers = {
            '1080': 1,
            '1440': 0.7,
            '2160': 0.4
        };
        score *= resolutionMultipliers[this.settings.resolution];

        // Ray tracing impact
        if (this.settings.rayTracing) {
            if (this.gpu.rtxSupport) {
                score *= this.gpu.specs.rayTracingPerformance;
            } else {
                score *= 0.4;
            }
        }

        // DLSS/FSR boost
        if (this.settings.dlss) {
            if (this.gpu.dlssSupport) {
                score *= 1.4;
            } else if (this.gpu.specs.fsrVersion) {
                score *= 1.3;
            }
        }

        return score;
    }

    getRecommendations() {
        const bottleneck = this.analyzeBottleneck();
        const recommendations = [];

        // Basic recommendations
        if (bottleneck.bottleneck === 'cpu') {
            recommendations.push({
                type: 'upgrade',
                component: 'cpu',
                priority: 'high',
                reason: 'Tu CPU está limitando el rendimiento de tu GPU'
            });
        } else if (bottleneck.bottleneck === 'gpu') {
            recommendations.push({
                type: 'upgrade',
                component: 'gpu',
                priority: 'high',
                reason: 'Tu GPU está limitando el rendimiento general'
            });
        }

        // Game-specific recommendations
        if (this.game.features.rtx && !this.gpu.rtxSupport) {
            recommendations.push({
                type: 'feature',
                feature: 'rtx',
                priority: 'medium',
                reason: 'Este juego soporta ray tracing, pero tu GPU no'
            });
        }

        // RAM recommendations
        if (this.settings.ram < this.game.requirements.recRam) {
            recommendations.push({
                type: 'upgrade',
                component: 'ram',
                priority: 'high',
                reason: `Se recomiendan ${this.game.requirements.recRam}GB de RAM para este juego`
            });
        }

        // Settings recommendations
        if (this.settings.resolution === '2160' && bottleneck.ratio < 0.7) {
            recommendations.push({
                type: 'settings',
                setting: 'resolution',
                suggestion: '1440',
                priority: 'medium',
                reason: 'Bajar a 1440p mejoraría significativamente el rendimiento'
            });
        }

        return recommendations;
    }

    estimateFPS() {
        const bottleneck = this.analyzeBottleneck();
        const basePerformance = Math.min(bottleneck.cpuScore, bottleneck.gpuScore);
        
        // Calculate base FPS
        let fps = basePerformance * 100;
        
        // Apply quality settings
        fps *= this.game.settings[this.settings.quality];
        
        // Apply game-specific optimizations
        if (this.settings.dlss && this.gpu.dlssSupport) {
            fps *= 1.4;
        }
        
        return {
            average: Math.round(fps),
            onePercent: Math.round(fps * 0.8),
            estimatedStability: this.calculateStability()
        };
    }

    calculateStability() {
        let stability = 1.0;
        
        // RAM impact on stability
        if (this.settings.ram < this.game.requirements.recRam) {
            stability *= 0.8;
        }
        
        // CPU thread count impact
        const recommendedThreads = this.game.requirements.recThreads || 12;
        if (this.cpu.threads < recommendedThreads) {
            stability *= 0.9;
        }
        
        // VRAM impact
        const recommendedVram = this.game.requirements.recVram || 8;
        const gpuVram = parseInt(this.gpu.vram);
        if (gpuVram < recommendedVram) {
            stability *= 0.85;
        }
        
        return Math.round(stability * 100);
    }
}
