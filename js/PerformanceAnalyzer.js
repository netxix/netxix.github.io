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
            ratio,
            severity: this.calculateBottleneckSeverity(ratio)
        };
    }

    calculateBottleneckSeverity(ratio) {
        const deviation = Math.abs(1 - ratio);
        if (deviation <= 0.15) return { level: 'none', impact: 0 };
        if (deviation <= 0.30) return { level: 'mild', impact: 1 };
        if (deviation <= 0.50) return { level: 'moderate', impact: 2 };
        return { level: 'severe', impact: 3 };
    }

    calculateCpuScore() {
        let score = this.cpu.performance;
        
        // Factor in CPU-intensive aspects
        if (this.game.cpuDependency === 'high') {
            score *= 1.2;
        } else if (this.game.cpuDependency === 'low') {
            score *= 0.8;
        }

        // RAM impact
        if (this.settings.ram < this.game.requirements.recRam) {
            score *= 0.85;
        }

        // Resolution impact (lower resolutions are more CPU bound)
        const resolutionMultipliers = {
            '1080': 1.1,
            '1440': 1.0,
            '2160': 0.9
        };
        score *= resolutionMultipliers[this.settings.resolution];

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

        // Quality settings impact
        const qualityMultipliers = {
            'low': 1.5,
            'medium': 1.2,
            'high': 1.0,
            'ultra': 0.8
        };
        score *= qualityMultipliers[this.settings.quality];

        // Ray tracing impact
        if (this.settings.rayTracing) {
            if (this.gpu.rtxSupport) {
                score *= this.gpu.rtxPerformance;
            } else {
                score *= 0.4;
            }
        }

        // DLSS/FSR boost
        if (this.settings.dlss) {
            if (this.gpu.dlssSupport) {
                score *= this.gpu.dlssBoost;
            } else if (this.gpu.fsrSupport) {
                score *= this.gpu.fsrBoost;
            }
        }

        return score;
    }

    calculateStability() {
        let stability = 1.0;
        const issues = [];
        
        // RAM impact
        if (this.settings.ram < this.game.requirements.recRam) {
            stability *= 0.8;
            issues.push({
                component: 'RAM',
                severity: 'moderate',
                message: `Se recomiendan ${this.game.requirements.recRam}GB de RAM`
            });
        }
        
        // CPU thread count impact
        const recommendedThreads = this.game.requirements.recThreads || 8;
        if (this.cpu.threads < recommendedThreads) {
            stability *= 0.9;
            issues.push({
                component: 'CPU',
                severity: 'mild',
                message: `Se recomiendan ${recommendedThreads} hilos`
            });
        }
        
        // VRAM impact
        if (this.gpu.vram < this.game.requirements.recVram) {
            stability *= 0.85;
            issues.push({
                component: 'GPU',
                severity: 'moderate',
                message: `Se recomiendan ${this.game.requirements.recVram}GB de VRAM`
            });
        }

        // Check for overall bottleneck
        const bottleneck = this.analyzeBottleneck();
        if (bottleneck.severity.level !== 'none') {
            stability *= (1 - (bottleneck.severity.impact * 0.1));
            issues.push({
                component: bottleneck.bottleneck.toUpperCase(),
                severity: bottleneck.severity.level,
                message: `Cuello de botella detectado en ${bottleneck.bottleneck.toUpperCase()}`
            });
        }
        
        return {
            score: Math.round(stability * 100),
            issues
        };
    }

    getRecommendations() {
        const bottleneck = this.analyzeBottleneck();
        const stability = this.calculateStability();
        const recommendations = [];

        // Bottleneck recommendations
        if (bottleneck.bottleneck === 'cpu') {
            recommendations.push({
                type: 'upgrade',
                component: 'cpu',
                priority: bottleneck.severity.level,
                reason: 'Tu CPU está limitando el rendimiento de tu GPU'
            });
        } else if (bottleneck.bottleneck === 'gpu') {
            recommendations.push({
                type: 'upgrade',
                component: 'gpu',
                priority: bottleneck.severity.level,
                reason: 'Tu GPU está limitando el rendimiento general'
            });
        }

        // RAM recommendations
        if (this.settings.ram < this.game.requirements.recRam) {
            recommendations.push({
                type: 'upgrade',
                component: 'ram',
                priority: 'moderate',
                reason: `Se recomiendan ${this.game.requirements.recRam}GB de RAM para un rendimiento óptimo`
            });
        }

        // VRAM recommendations
        if (this.gpu.vram < this.game.requirements.recVram) {
            recommendations.push({
                type: 'upgrade',
                component: 'gpu',
                priority: 'high',
                reason: `Se requieren ${this.game.requirements.recVram}GB de VRAM para texturas de alta calidad`
            });
        }

        // Feature recommendations
        if (this.game.features.rtx && !this.gpu.rtxSupport) {
            recommendations.push({
                type: 'feature',
                feature: 'rtx',
                priority: 'low',
                reason: 'Este juego soporta ray tracing, pero tu GPU no'
            });
        }

        // Performance optimization recommendations
        if (stability.score < 70) {
            if (this.settings.resolution === '2160') {
                recommendations.push({
                    type: 'setting',
                    setting: 'resolution',
                    value: '1440',
                    priority: 'high',
                    reason: 'Reducir resolución a 1440p para mejor rendimiento'
                });
            } else if (this.settings.resolution === '1440') {
                recommendations.push({
                    type: 'setting',
                    setting: 'resolution',
                    value: '1080',
                    priority: 'high',
                    reason: 'Reducir resolución a 1080p para mejor rendimiento'
                });
            }
        }

        return recommendations;
    }

    estimateFPS() {
        const bottleneck = this.analyzeBottleneck();
        const basePerformance = Math.min(bottleneck.cpuScore, bottleneck.gpuScore);
        
        // Calculate base FPS
        let fps = basePerformance * 100;
        
        // Apply quality settings
        const qualityMultipliers = {
            'low': 1.5,
            'medium': 1.2,
            'high': 1.0,
            'ultra': 0.8
        };
        fps *= qualityMultipliers[this.settings.quality];
        
        // Apply game-specific optimizations
        if (this.settings.dlss && this.gpu.dlssSupport) {
            fps *= this.gpu.dlssBoost;
        } else if (this.settings.dlss && this.gpu.fsrSupport) {
            fps *= this.gpu.fsrBoost;
        }

        // Apply stability factor
        const stability = this.calculateStability();
        fps *= (stability.score / 100);
        
        return {
            average: Math.round(fps),
            onePercent: Math.round(fps * 0.8),
            pointOne: Math.round(fps * 0.7),
            stability: stability.score,
            issues: stability.issues
        };
    }
}
