import icons from '../assets/fonts/devicon.json';

export default function getIconClass(skill) {
  const trimmedSkill = skill.replace(/(\.| ).*$/, '');
  const icon = icons.find(icon => icon.name.includes(trimmedSkill.toLowerCase()));
  return icon ? `${icon.name}-${icon.versions.font[0]}` : null;
}
