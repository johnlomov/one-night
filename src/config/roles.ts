export type RoleTeam = 'village' | 'werewolf' | 'solo'

export interface Role {
  id: string
  name: string
  team: RoleTeam
  description: string
  maxCount: number
  nightAction?: string
  wakeUpOrder?: number
}

export type NightRole = Role & {
  nightAction: string
  wakeUpOrder: number
}

export const roleTeamLabels: Record<RoleTeam, string> = {
  village: 'Деревня',
  werewolf: 'Оборотни',
  solo: 'Одиночка',
}

export const roles: Role[] = [
  {
    id: 'doppelganger',
    name: 'Двойник',
    team: 'village',
    description: 'Смотрит карту другого игрока и становится этой ролью.',
    maxCount: 1,
    nightAction:
      'Двойник, проснись и посмотри карту другого игрока. Теперь ты выполняешь действие этой роли.',
    wakeUpOrder: 10,
  },
  {
    id: 'werewolf',
    name: 'Оборотень',
    team: 'werewolf',
    description: 'Ищет других оборотней. Одинокий оборотень может посмотреть карту из центра.',
    maxCount: 2,
    nightAction:
      'Оборотни, проснитесь и найдите друг друга. Если ты один, можешь посмотреть одну карту в центре.',
    wakeUpOrder: 20,
  },
  {
    id: 'minion',
    name: 'Приспешник',
    team: 'werewolf',
    description: 'Узнаёт оборотней и побеждает вместе с ними.',
    maxCount: 1,
    nightAction: 'Приспешник, проснись. Оборотни, покажите большие пальцы, чтобы он узнал вас.',
    wakeUpOrder: 30,
  },
  {
    id: 'mason',
    name: 'Масон',
    team: 'village',
    description: 'Ищет других масонов. Если масон один, он просто узнаёт это.',
    maxCount: 2,
    nightAction: 'Масоны, проснитесь и найдите друг друга.',
    wakeUpOrder: 40,
  },
  {
    id: 'seer',
    name: 'Гадалка',
    team: 'village',
    description: 'Смотрит карту игрока или две карты из центра.',
    maxCount: 1,
    nightAction: 'Гадалка, проснись. Посмотри карту другого игрока или две карты в центре.',
    wakeUpOrder: 50,
  },
  {
    id: 'robber',
    name: 'Грабитель',
    team: 'village',
    description: 'Меняет свою карту с картой другого игрока и смотрит новую роль.',
    maxCount: 1,
    nightAction:
      'Грабитель, проснись. Поменяй свою карту с картой другого игрока и посмотри свою новую карту.',
    wakeUpOrder: 60,
  },
  {
    id: 'troublemaker',
    name: 'Скандалист',
    team: 'village',
    description: 'Меняет местами карты двух других игроков, не глядя на них.',
    maxCount: 1,
    nightAction:
      'Скандалист, проснись. Поменяй местами карты двух других игроков, не глядя на них.',
    wakeUpOrder: 70,
  },
  {
    id: 'drunk',
    name: 'Пьяница',
    team: 'village',
    description: 'Меняет свою карту на одну карту из центра, не глядя на неё.',
    maxCount: 1,
    nightAction: 'Пьяница, проснись. Поменяй свою карту на одну карту из центра, не глядя.',
    wakeUpOrder: 80,
  },
  {
    id: 'insomniac',
    name: 'Полуночница',
    team: 'village',
    description: 'В конце ночи смотрит свою карту, чтобы узнать текущую роль.',
    maxCount: 1,
    nightAction: 'Полуночница, проснись и посмотри свою карту.',
    wakeUpOrder: 90,
  },
  {
    id: 'villager',
    name: 'Деревенщина',
    team: 'village',
    description: 'Не просыпается ночью. Побеждает вместе с деревней.',
    maxCount: 3,
  },
  {
    id: 'tanner',
    name: 'Кожевник',
    team: 'solo',
    description: 'Не просыпается ночью. Побеждает, если его казнят голосованием.',
    maxCount: 1,
  },
  {
    id: 'hunter',
    name: 'Охотник',
    team: 'village',
    description: 'Не просыпается ночью. Если погибает, вместе с ним погибает выбранный им игрок.',
    maxCount: 1,
  },
]

export const rolesById = new Map(roles.map((role) => [role.id, role]))

export const defaultSelectedRoleIds = [
  'werewolf',
  'werewolf',
  'seer',
  'robber',
  'troublemaker',
  'villager',
] as const

export const recommendedRoleOrder = [
  'werewolf',
  'werewolf',
  'seer',
  'robber',
  'troublemaker',
  'villager',
  'minion',
  'mason',
  'mason',
  'drunk',
  'insomniac',
  'tanner',
  'hunter',
] as const

export function getRoleById(roleId: string) {
  return rolesById.get(roleId)
}

export function getRoleCount(roleIds: string[], roleId: string) {
  return roleIds.filter((selectedRoleId) => selectedRoleId === roleId).length
}

export function getNightRoles(roleIds: string[]) {
  const uniqueRoleIds = Array.from(new Set(roleIds))

  return uniqueRoleIds
    .map((roleId) => getRoleById(roleId))
    .filter((role): role is NightRole => Boolean(role?.nightAction && role.wakeUpOrder))
    .sort((firstRole, secondRole) => firstRole.wakeUpOrder - secondRole.wakeUpOrder)
}
