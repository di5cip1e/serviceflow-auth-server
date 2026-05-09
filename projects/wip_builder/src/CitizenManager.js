import { Config } from "./Config.js";
import { IsoUtils } from "./IsoUtils.js";
import { getBuildingConfig } from "./BuildingRegistry.js";

export const CITIZEN_TYPES = {
    MODEL: { name: "Model Citizen", emoji: "😇", minHappiness: 0.9, crimeRisk: 0 },
    NORMAL: { name: "Citizen", emoji: "🙂", minHappiness: 0.6, crimeRisk: 0.05 },
    DISGRUNTLED: { name: "Disgruntled", emoji: "😠", minHappiness: 0.3, crimeRisk: 0.2 },
    PETTY: { name: "Petty Criminal", emoji: "🕵️", minHappiness: 0.1, crimeRisk: 0.5 },
    CRIMINAL: { name: "Criminal", emoji: "🦹", minHappiness: -0.2, crimeRisk: 0.7 },
    CAREER: { name: "Career Criminal", emoji: "👺", minHappiness: -0.5, crimeRisk: 0.9 },
    MENACE: { name: "Menace", emoji: "💀", minHappiness: -1.0, crimeRisk: 1.0 }
};

const NAMES = ["Alex", "Jordan", "Taylor", "Casey", "Riley", "Quinn", "Skylar", "Avery", "Parker", "Morgan", "Sam", "Robin", "Charlie", "Dakota", "Jamie", "Hayden", "Emerson", "Finley", "Rowan", "Skyler"];

export class CitizenManager {
    constructor(scene) {
        this.scene = scene;
        this.citizens = [];
        this.policeOfficers = [];
        this.prisoners = [];
    }

    syncWithPopulation(count) {
        const currentCount = this.citizens.length;
        if (count > currentCount) {
            for (let i = 0; i < count - currentCount; i++) {
                this.addCitizen();
            }
        } else if (count < currentCount) {
            for (let i = 0; i < currentCount - count; i++) {
                this.removeCitizen();
            }
        }
        this.syncPoliceOfficers();
    }

    syncPoliceOfficers() {
        const stations = [];
        for (let r = 0; r < this.scene.gridManager.currentGridSize; r++) {
            for (let c = 0; c < this.scene.gridManager.currentGridSize; c++) {
                const tile = this.scene.gridManager.grid[r][c];
                if (tile.buildingType === "policeStation") {
                    stations.push(tile);
                }
            }
        }

        const targetCount = stations.length;
        const currentCount = this.policeOfficers.length;

        if (targetCount > currentCount) {
            for (let i = 0; i < targetCount - currentCount; i++) {
                this.addPoliceOfficer(stations[currentCount + i]);
            }
        } else if (targetCount < currentCount) {
            for (let i = 0; i < currentCount - targetCount; i++) {
                const officer = this.policeOfficers.pop();
                if (officer && officer.visual) officer.visual.destroy();
            }
        }
    }

    addPoliceOfficer(station) {
        const visual = this.scene.add.text(station.x, station.y - 30, "👮", { fontSize: "20px" }).setOrigin(0.5);
        this.scene.gridManager.container.add(visual);
        
        const officer = {
            station,
            visual,
            state: "PATROL",
            target: null
        };
        
        this.policeOfficers.push(officer);
    }

    addCitizen() {
        const id = Math.random().toString(36).substr(2, 9);
        const name = NAMES[Math.floor(Math.random() * NAMES.length)] + " " + (this.citizens.length + 1);
        
        const citizen = {
            id,
            name,
            happiness: this.scene.getEffectiveHappiness(),
            job: null,
            type: "NORMAL",
            homeTile: this.findHome(),
            state: "WANDER",
            visual: this.createVisual()
        };
        
        this.citizens.push(citizen);
        this.updateCitizenType(citizen);
    }

    findHome() {
        const houses = [];
        for (let r = 0; r < this.scene.gridManager.currentGridSize; r++) {
            for (let c = 0; c < this.scene.gridManager.currentGridSize; c++) {
                const tile = this.scene.gridManager.grid[r][c];
                if (tile.buildingType === "house") {
                    houses.push(tile);
                }
            }
        }
        return houses.length > 0 ? houses[Math.floor(Math.random() * houses.length)] : null;
    }

    removeCitizen() {
        const citizen = this.citizens.pop();
        if (citizen && citizen.visual) {
            citizen.visual.destroy();
        }
    }

    createVisual() {
        // Random start position on a grass tile if possible
        const row = Math.floor(Math.random() * Config.gridSize);
        const col = Math.floor(Math.random() * Config.gridSize);
        const worldPos = IsoUtils.gridToWorld(row, col);
        
        const text = this.scene.add.text(worldPos.x, worldPos.y - 30, "🙂", { fontSize: "20px" }).setOrigin(0.5);
        text.gridRow = row;
        text.gridCol = col;
        this.scene.gridManager.container.add(text);
        
        return text;
    }

    getCriminals() {
        return this.citizens.filter(c => CITIZEN_TYPES[c.type].crimeRisk > 0.1);
    }

    update() {
        const townHappiness = this.scene.getEffectiveHappiness();
        const policePresence = this.scene.gridManager.countTiles("policeStation");

        this.citizens.forEach(citizen => {
            if (citizen.isPrisoner) return; 

            // Citizen happiness trends towards town happiness
            citizen.happiness = Phaser.Math.Linear(citizen.happiness, townHappiness, 0.01);
            
            // Unemployment penalty
            if (!citizen.job) {
                citizen.happiness -= 0.005; // Slightly harsher unemployment penalty
            }

            // Crime risk reduction by police
            const crimeReduction = policePresence * 0.05;
            this.updateCitizenType(citizen, crimeReduction);
        });

        this.updatePolicePatrols();
        this.updatePrisoners();
    }

    /** 
     * Called every frame from GameScene.update 
     */
    updateVisuals(delta) {
        this.citizens.forEach(citizen => {
            if (citizen.isPrisoner) return; 

            // Schedule change logic - checked every frame but with small probability
            // Probability is adjusted by delta to be frame-rate independent
            // Let's aim for a check once every few seconds on average
            if (Math.random() < 0.002) { 
                this.updateCitizenSchedule(citizen);
            }
        });
    }

    updateCitizenSchedule(citizen) {
        // Daily behavior: Random chance to change destination
        const rand = Math.random();
        
        // Try to find a home if they don't have one
        if (!citizen.homeTile) {
            citizen.homeTile = this.findHome();
        }

        if (citizen.job && rand < 0.4) {
            citizen.state = "WORK";
        } else if (citizen.homeTile && rand < 0.7) {
            citizen.state = "HOME";
        } else {
            citizen.state = "WANDER";
        }

        let targetX, targetY;
        if (citizen.state === "WORK" && citizen.job) {
            targetX = citizen.job.tile.x;
            targetY = citizen.job.tile.y;
        } else if (citizen.state === "HOME" && citizen.homeTile) {
            targetX = citizen.homeTile.x;
            targetY = citizen.homeTile.y;
        } else {
            const row = Math.floor(Math.random() * this.scene.gridManager.currentGridSize);
            const col = Math.floor(Math.random() * this.scene.gridManager.currentGridSize);
            const pos = IsoUtils.gridToWorld(row, col);
            targetX = pos.x;
            targetY = pos.y;
        }

        if (citizen.visual && !citizen.isBeingPursued) {
            this.scene.tweens.killTweensOf(citizen.visual);
            
            // Walk speed: slower for wandering, faster for commuting
            const isCommuting = citizen.state !== "WANDER";
            const duration = isCommuting ? 3000 + Math.random() * 2000 : 5000 + Math.random() * 5000;

            this.scene.tweens.add({
                targets: citizen.visual,
                x: targetX,
                y: targetY - 30,
                duration: duration,
                ease: "Sine.easeInOut",
                onUpdate: () => {
                    const grid = IsoUtils.worldToGrid(citizen.visual.x, citizen.visual.y);
                    citizen.visual.gridRow = grid.row;
                    citizen.visual.gridCol = grid.col;
                }
            });
        }
    }

    updatePolicePatrols() {
        const criminals = this.getCriminals().filter(c => !c.isPrisoner && !c.isBeingPursued);
        
        this.policeOfficers.forEach(officer => {
            if (officer.state === "PATROL") {
                // Look for nearest criminal
                let nearest = null;
                let minDist = 300; // Detection range

                criminals.forEach(criminal => {
                    const dist = Phaser.Math.Distance.Between(officer.visual.x, officer.visual.y, criminal.visual.x, criminal.visual.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = criminal;
                    }
                });

                if (nearest) {
                    officer.state = "PURSUIT";
                    officer.target = nearest;
                    nearest.isBeingPursued = true;
                    this.scene.showFloatingText("HALT! 👮", officer.visual.x, officer.visual.y);
                    // Stop any patrol tweens
                    this.scene.tweens.killTweensOf(officer.visual);
                } else {
                    // Just drift around station
                    if (!this.scene.tweens.isTweening(officer.visual)) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 50 + Math.random() * 50;
                        this.scene.tweens.add({
                            targets: officer.visual,
                            x: officer.station.x + Math.cos(angle) * dist,
                            y: officer.station.y + Math.sin(angle) * dist - 30,
                            duration: 3000,
                            ease: "Sine.easeInOut"
                        });
                    }
                }
            } else if (officer.state === "PURSUIT") {
                const target = officer.target;
                if (!target || target.isPrisoner || !target.visual) {
                    if (target) target.isBeingPursued = false;
                    officer.state = "PATROL";
                    officer.target = null;
                    return;
                }

                // Move towards target
                const angle = Phaser.Math.Angle.Between(officer.visual.x, officer.visual.y, target.visual.x, target.visual.y);
                const speed = 2;
                officer.visual.x += Math.cos(angle) * speed;
                officer.visual.y += Math.sin(angle) * speed;

                // Check for catch
                const dist = Phaser.Math.Distance.Between(officer.visual.x, officer.visual.y, target.visual.x, target.visual.y);
                if (dist < 20) {
                    this.arrestCriminal(target);
                    target.isBeingPursued = false;
                    officer.state = "PATROL";
                    officer.target = null;
                    
                    // Return to station
                    this.scene.tweens.add({
                        targets: officer.visual,
                        x: officer.station.x,
                        y: officer.station.y - 30,
                        duration: 2000,
                        ease: "Power2"
                    });
                }
            }
        });
    }

    updatePrisoners() {
        for (let i = this.prisoners.length - 1; i >= 0; i--) {
            const prisoner = this.prisoners[i];
            prisoner.sentenceTicks--;

            if (prisoner.sentenceTicks <= 0) {
                this.releasePrisoner(prisoner);
                this.prisoners.splice(i, 1);
            }
        }
    }

    releasePrisoner(citizen) {
        citizen.isPrisoner = false;
        citizen.happiness = 0.9; // Fully rehabilitated
        this.updateCitizenType(citizen);
        
        if (citizen.visual) {
            citizen.visual.setVisible(true);
            citizen.visual.setAlpha(1);
            // Move back to city
            const row = Math.floor(Math.random() * Config.gridSize);
            const col = Math.floor(Math.random() * Config.gridSize);
            const worldPos = IsoUtils.gridToWorld(row, col);
            citizen.visual.setPosition(worldPos.x, worldPos.y - 30);
        }

        this.scene.showFloatingText("RELEASED! ✨", citizen.visual.x, citizen.visual.y);
    }

    getJailWithCapacity() {
        for (let r = 0; r < this.scene.gridManager.currentGridSize; r++) {
            for (let c = 0; c < this.scene.gridManager.currentGridSize; c++) {
                const tile = this.scene.gridManager.grid[r][c];
                if (tile.buildingType === "jail" && tile.isMaster) {
                    const config = getBuildingConfig("jail");
                    const currentOccupants = this.prisoners.filter(p => p.jailTile === tile).length;
                    if (currentOccupants < config.prisonerCapacity) {
                        return tile;
                    }
                }
            }
        }
        return null;
    }

    arrestCriminal(citizen) {
        const jail = this.getJailWithCapacity();
        
        if (jail) {
            citizen.isPrisoner = true;
            citizen.jailTile = jail;
            citizen.sentenceTicks = 10; // Sentence duration in ticks
            this.prisoners.push(citizen);

            if (citizen.visual) {
                // Move to jail
                citizen.visual.setPosition(jail.x, jail.y - 30);
                citizen.visual.setAlpha(0.5); // "Incarcerated" visual state
            }
            
            this.scene.showFloatingText("JAILED! ⚖️", citizen.visual.x, citizen.visual.y);
        } else {
            // No jail space, immediate rehabilitation but lower happiness
            citizen.happiness = 0.5;
            this.updateCitizenType(citizen);
            this.scene.showFloatingText("NO JAIL SPACE! ⚠️", citizen.visual.x, citizen.visual.y);
        }

        this.scene.playUISound();
    }

    updateCitizenType(citizen, crimeReduction = 0) {
        let selectedType = "MENACE";
        for (const [key, data] of Object.entries(CITIZEN_TYPES)) {
            if (citizen.happiness >= data.minHappiness) {
                selectedType = key;
                break;
            }
        }

        // Criminals can be rehabilitated by police or high happiness
        if (CITIZEN_TYPES[selectedType].crimeRisk > 0) {
            if (Math.random() < crimeReduction) {
                selectedType = "NORMAL"; // Rehabilitated
            }
        }

        citizen.type = selectedType;
        if (citizen.visual) {
            citizen.visual.setText(CITIZEN_TYPES[selectedType].emoji);
        }
    }

    getAvailableJobs() {
        const jobs = [];
        const buildings = this.scene.gridManager.grid.flat().filter(t => (t.isMaster || !t.masterTile) && t.buildingType !== "grass");
        
        buildings.forEach(tile => {
            const config = getBuildingConfig(tile.buildingType);
            if (config.jobSlots) {
                const filled = this.citizens.filter(c => c.job && c.job.tile === tile).length;
                for (let i = 0; i < config.jobSlots - filled; i++) {
                    jobs.push({ type: config.jobType, tile });
                }
            }
        });
        return jobs;
    }

    assignJob(citizenId, job) {
        const citizen = this.citizens.find(c => c.id === citizenId);
        if (citizen) {
            citizen.job = job;
            citizen.happiness += 0.1; // Bonus for getting a job
        }
    }

    autoAssignJobs() {
        const unemployed = this.citizens.filter(c => !c.job);
        const availableJobs = this.getAvailableJobs();
        
        unemployed.forEach(citizen => {
            if (availableJobs.length > 0) {
                const job = availableJobs.shift();
                this.assignJob(citizen.id, job);
            }
        });
    }

    save() {
        return this.citizens.map(c => ({
            id: c.id,
            name: c.name,
            happiness: c.happiness,
            job: c.job ? { type: c.job.type, row: c.job.tile.gridRow, col: c.job.tile.gridCol } : null,
            homeTile: c.homeTile ? { row: c.homeTile.gridRow, col: c.homeTile.gridCol } : null,
            type: c.type,
            state: c.state,
            isPrisoner: c.isPrisoner,
            sentenceTicks: c.sentenceTicks
        }));
    }

    load(data) {
        if (!data) return;
        this.citizens.forEach(c => {
            if (c.visual) c.visual.destroy();
        });
        this.citizens = data.map(d => {
            const visual = this.createVisual();
            let job = null;
            if (d.job) {
                const tile = this.scene.gridManager.getTileAt(d.job.row, d.job.col);
                if (tile) job = { type: d.job.type, tile };
            }
            let homeTile = null;
            if (d.homeTile) {
                homeTile = this.scene.gridManager.getTileAt(d.homeTile.row, d.homeTile.col);
            }
            const citizen = { ...d, visual, job, homeTile };
            this.updateCitizenType(citizen);
            
            if (citizen.isPrisoner) {
                this.prisoners.push(citizen);
                if (citizen.visual) citizen.visual.setAlpha(0.5);
            }

            return citizen;
        });
    }
}