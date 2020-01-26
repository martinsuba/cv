import getIconClass from '../get-icon-class';

import './skills.css';

export default function skills({ skills }) {
  return (
    <section className="skills">
      <h1>Skills</h1>
      {
        Object.entries(skills).map(([key, value]) => (
          <div className="item">
            <h2>{ key }:</h2>
            <ul>
              {
                value.map(skill => (
                  <li>
                    <i class={`devicon-${getIconClass(skill)} colored`}></i>
                    <span>{skill}</span>
                  </li>
                ))
              }
            </ul>
          </div>
        ))
      }
    </section>
  );
}
