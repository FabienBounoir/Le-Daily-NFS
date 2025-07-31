import { ObjectId } from "mongodb";
import { db } from "../db.server";

class RecapService {
    constructor() {
        this.dailyCollection = db.collection("daily");
        this.speakerCollection = db.collection("speakers");
    }

    async generateRecap(team, startDate, endDate, speakerName = null) {
        const query = {
            team,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        // Récupérer tous les dailies de la période
        const allDailies = await this.dailyCollection.find(query).sort({ date: -1 }).toArray();

        // Si un speaker spécifique est demandé, calculer ses statistiques personnelles
        let dailies, totalTime, averageTime, speakerSessions = [];

        if (speakerName) {
            // Pour un speaker spécifique, chercher ses temps de parole dans la collection speakers
            const speakerStats = await this.speakerCollection.find({
                name: speakerName,
                team,
                "history.date": {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            }).toArray();

            // Extraire les sessions de ce speaker dans la période
            speakerSessions = [];
            speakerStats.forEach(speaker => {
                if (speaker.history) {
                    speaker.history.forEach(session => {
                        const sessionDate = new Date(session.date);
                        if (sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate)) {
                            speakerSessions.push({
                                date: sessionDate,
                                time: session.time, // temps en secondes
                                dailyId: session.dailyId
                            });
                        }
                    });
                }
            });

            // Filtrer les dailies où ce speaker a participé
            dailies = allDailies.filter(daily => {
                return speakerSessions.some(session => session.dailyId === daily._id.toString());
            });

            // Calculer les temps à partir des sessions du speaker (en secondes)
            totalTime = speakerSessions.reduce((sum, session) => sum + (session.time || 0), 0);
            averageTime = speakerSessions.length > 0 ? totalTime / speakerSessions.length : 0;
        } else {
            // Pour l'équipe complète, utiliser les totalTime des dailies
            dailies = allDailies;
            totalTime = dailies.reduce((sum, daily) => sum + (daily.totalTime || 0), 0);
            averageTime = dailies.length > 0 ? totalTime / dailies.length : 0;
        }

        if (dailies.length === 0) {
            return {
                period: { startDate, endDate },
                team,
                speakerName,
                totalDailies: 0,
                message: "Aucun daily trouvé pour cette période"
            };
        }

        const longestDaily = speakerName ?
            (speakerSessions.length > 0 ? Math.max(...speakerSessions.map(s => s.time || 0)) : 0) :
            Math.max(...dailies.map(d => d.totalTime || 0));

        const shortestDaily = speakerName ?
            (speakerSessions.length > 0 ? Math.min(...speakerSessions.map(s => s.time || 0)) : 0) :
            Math.min(...dailies.map(d => d.totalTime || 0));

        // Calculs fun (temps en secondes)
        const coffeeEquivalent = Math.round(dailies.length * 1.2);
        const timeInMinutes = Math.round(totalTime / 60);
        const songsEquivalent = Math.round(timeInMinutes / 3.5);
        const netflixEpisodes = Math.round(timeInMinutes / 22);
        const twitterPosts = Math.round(timeInMinutes / 2);

        // Analyse par jour de la semaine (seulement lundi-vendredi pour les dailies)
        const workdayCount = new Array(5).fill(0); // Lundi=0, Mardi=1, ..., Vendredi=4
        const workdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

        dailies.forEach(daily => {
            const dayOfWeek = new Date(daily.date).getDay();
            // Convertir: dimanche=0 -> pas compté, lundi=1 -> index 0, ..., vendredi=5 -> index 4
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                workdayCount[dayOfWeek - 1]++;
            }
        });

        const bestDayIndex = workdayCount.indexOf(Math.max(...workdayCount));
        const bestDay = bestDayIndex >= 0 ? workdays[bestDayIndex] : 'Aucun';

        // Analyse par heure (seulement pour les heures de bureau)
        const hourCount = new Array(24).fill(0);
        dailies.forEach(daily => {
            const hour = new Date(daily.date).getHours();
            hourCount[hour]++;
        });

        const peakHour = hourCount.indexOf(Math.max(...hourCount));

        let preferredTime = 'Matin';
        const morningCount = hourCount.slice(8, 12).reduce((a, b) => a + b, 0);  // 8h-12h
        const afternoonCount = hourCount.slice(12, 17).reduce((a, b) => a + b, 0); // 12h-17h
        const lateAfternoonCount = hourCount.slice(17, 19).reduce((a, b) => a + b, 0); // 17h-19h

        if (afternoonCount > morningCount && afternoonCount > lateAfternoonCount) {
            preferredTime = 'Début d\'après-midi';
        } else if (lateAfternoonCount > morningCount && lateAfternoonCount > afternoonCount) {
            preferredTime = 'Fin d\'après-midi';
        }

        // Calcul des streaks (seulement les jours ouvrés)
        const sortedDailies = dailies.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        let currentStreak = 0;
        let longestStreak = 0;
        let previousWorkdayDate = null;

        sortedDailies.forEach((daily, index) => {
            const currentDate = new Date(daily.date);
            const currentDay = currentDate.getDay();

            // Ignorer les weekends (ne devraient pas exister dans les dailies)
            if (currentDay === 0 || currentDay === 6) {
                return;
            }

            if (previousWorkdayDate) {
                const workdaysDiff = this.getWorkdaysDifference(previousWorkdayDate, currentDate);

                if (workdaysDiff === 1) {
                    // Jour ouvré consécutif
                    currentStreak++;
                } else if (workdaysDiff === 0) {
                    // Même jour (ne devrait pas arriver mais on garde le streak)
                    // Ne rien faire, garder le streak actuel
                } else {
                    // Plus d'un jour ouvré d'écart, restart le streak
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            previousWorkdayDate = currentDate;
        });
        longestStreak = Math.max(longestStreak, currentStreak);

        // Régularité basée sur les jours ouvrés dans la période
        // Compter les jours DISTINCTS où des dailies ont eu lieu, pas le nombre total de dailies
        const uniqueDailyDates = new Set();
        dailies.forEach(daily => {
            const dailyDate = new Date(daily.date);
            const dateKey = `${dailyDate.getFullYear()}-${dailyDate.getMonth()}-${dailyDate.getDate()}`;
            uniqueDailyDates.add(dateKey);
        });

        const workdaysInPeriod = this.getWorkdaysInPeriod(new Date(startDate), new Date(endDate));
        const regularity = workdaysInPeriod > 0 ? Math.round((uniqueDailyDates.size / workdaysInPeriod) * 100) : 0;

        // Stats sociales
        let socialStats = {};
        if (speakerName) {
            const participationRate = 100; // 100% car on a filtré par ce speaker

            // Analyser avec qui il/elle fait le plus souvent des dailies
            const colleagues = {};
            dailies.forEach(daily => {
                if (daily.users) {
                    daily.users.forEach(user => {
                        if (user !== speakerName) {
                            colleagues[user] = (colleagues[user] || 0) + 1;
                        }
                    });
                }
            });

            const bestBuddy = Object.keys(colleagues).length > 0 ?
                Object.keys(colleagues).reduce((a, b) => colleagues[a] > colleagues[b] ? a : b) : '';

            socialStats = {
                participationRate,
                bestBuddy
            };
        } else {
            // Pour l'équipe
            const userStats = {};
            dailies.forEach(daily => {
                if (daily.users) {
                    daily.users.forEach(user => {
                        if (!userStats[user]) {
                            userStats[user] = { count: 0 };
                        }
                        userStats[user].count++;
                    });
                }
            });

            const mostActive = Object.keys(userStats).length > 0 ?
                Object.keys(userStats).reduce((a, b) => userStats[a].count > userStats[b].count ? a : b) : '';

            const averageTeamSize = dailies.reduce((sum, d) => sum + (d.users ? d.users.length : 0), 0) / dailies.length;
            const smallestDaily = Math.min(...dailies.map(d => d.users ? d.users.length : 0));

            socialStats = {
                mostActive,
                averageTeamSize,
                smallestDaily
            };
        }

        // Achievements basés sur les nouveaux calculs
        const achievements = [];
        if (dailies.length >= 100) {
            achievements.push({
                name: "Centurion",
                description: "100+ dailies dans la période",
                icon: "🏆"
            });
        } else if (dailies.length >= 50) {
            achievements.push({
                name: "Vétéran",
                description: "50+ dailies dans la période",
                icon: "🥇"
            });
        } else if (dailies.length >= 25) {
            achievements.push({
                name: "Assidu",
                description: "25+ dailies dans la période",
                icon: "🥈"
            });
        } else if (dailies.length >= 10) {
            achievements.push({
                name: "Régulier",
                description: "10+ dailies dans la période",
                icon: "🥉"
            });
        }

        // Achievement basé sur le temps moyen (en secondes)
        if (averageTime < 60) { // moins de 1 minute
            achievements.push({
                name: "Bullet",
                description: "Ultra rapide (< 1min en moyenne)",
                icon: "🚀"
            });
        } else if (averageTime < 90) { // moins de 1min30
            achievements.push({
                name: "Éclair",
                description: "Super rapide (< 1min30 en moyenne)",
                icon: "💨"
            });
        } else if (averageTime < 120) { // moins de 2 minutes (120 secondes)
            achievements.push({
                name: "Flash",
                description: "Dailies express (< 2min en moyenne)",
                icon: "⚡"
            });
        }

        if (longestStreak >= 7) {
            achievements.push({
                name: "Marathon",
                description: `${longestStreak} jours consécutifs`,
                icon: "🏃"
            });
        }

        return {
            period: { startDate, endDate },
            team,
            speakerName,
            totalDailies: dailies.length,
            uniqueDays: uniqueDailyDates.size, // Nouveau: nombre de jours distincts avec dailies
            totalTime,
            averageTime,
            longestDaily,
            shortestDaily,
            dayStats: {
                bestDay,
                weekendCount: 0, // Les dailies n'ont pas lieu le weekend
                weekdayCount: uniqueDailyDates.size // Utiliser les jours distincts
            },
            hourStats: {
                peakHour,
                preferredTime,
                morningCount,
                afternoonCount,
                eveningCount: lateAfternoonCount
            },
            streakStats: {
                longestStreak,
                currentStreak,
                regularity
            },
            socialStats,
            funEquivalents: {
                coffee: coffeeEquivalent,
                songs: songsEquivalent,
                netflixEpisodes,
                twitterPosts,
                books: Math.round(timeInMinutes / (15 * 60))
            },
            achievements,
            recapDate: new Date()
        };
    }

    // Méthode helper pour obtenir les sessions d'un speaker
    async getSpeakerSessions(speakerName, team, startDate, endDate) {
        const speakerStats = await this.speakerCollection.find({
            name: speakerName,
            team,
            "history.date": {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).toArray();

        const sessions = [];
        speakerStats.forEach(speaker => {
            if (speaker.history) {
                speaker.history.forEach(session => {
                    const sessionDate = new Date(session.date);
                    if (sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate)) {
                        sessions.push({
                            date: sessionDate,
                            time: session.time,
                            dailyId: session.dailyId
                        });
                    }
                });
            }
        });
        return sessions;
    }

    // Calculer la différence en jours ouvrés entre deux dates
    getWorkdaysDifference(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const diffMilliseconds = date2.getTime() - date1.getTime();
        const diffDays = Math.round(diffMilliseconds / oneDay);

        // Si c'est le même jour, retourner 0
        if (diffDays === 0) return 0;

        // Si c'est le jour ouvré suivant
        if (diffDays === 1) {
            // Vérifier que les deux dates sont des jours ouvrés
            const day1 = date1.getDay();
            const day2 = date2.getDay();
            if (day1 >= 1 && day1 <= 5 && day2 >= 1 && day2 <= 5) {
                return 1;
            }
        }

        // Cas spécial : Vendredi -> Lundi (3 jours calendaires = 1 jour ouvré)
        if (diffDays === 3 && date1.getDay() === 5 && date2.getDay() === 1) {
            return 1;
        }

        // Pour tous les autres cas, compter les jours ouvrés entre les deux dates
        let workdayCount = 0;
        const current = new Date(date1);
        current.setDate(current.getDate() + 1); // Commencer le jour suivant

        while (current < date2) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                workdayCount++;
            }
            current.setDate(current.getDate() + 1);
        }

        return workdayCount;
    }

    // Calculer le nombre de jours ouvrés dans une période
    getWorkdaysInPeriod(startDate, endDate) {
        let count = 0;
        const current = new Date(startDate);

        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lundi à Vendredi
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    }

    generateFunQuotes(recap) {
        const quotes = [];

        if (recap.funEquivalents && recap.funEquivalents.coffee > 20) {
            quotes.push(`Tu aurais pu boire ${recap.funEquivalents.coffee} cafés pendant tous ces dailies ☕`);
        }

        if (recap.streakStats && recap.streakStats.longestStreak > 5) {
            quotes.push(`Ta plus longue série : ${recap.streakStats.longestStreak} jours d'affilée ! 🔥`);
        }

        if (recap.dayStats && recap.dayStats.bestDay) {
            quotes.push(`${recap.dayStats.bestDay} est clairement ton jour préféré pour les dailies ! 📅`);
        }

        if (recap.funEquivalents && recap.funEquivalents.songs > 0) {
            quotes.push(`${recap.funEquivalents.songs} chansons auraient pu être jouées pendant ce temps 🎵`);
        }

        if (recap.totalDailies > 0) {
            quotes.push(`En moyenne, tes dailies durent ${Math.round(recap.averageTime / 60)} minutes !`);
        }

        return quotes;
    }
}

export const recapService = new RecapService();
