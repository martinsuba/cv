import './experience.css';

export default function experience({ experience }) {
  return (
    <section className="experience">
      <h1>Experience</h1>
      {
        experience.map(item => (
          <div className="item">
            <h2>{ item.title }</h2>
            <h3><a href={ item.company.link } target="_blank">{ item.company.name }</a></h3>
            <span>{ item.from } - { item.to }</span>
            <div>{ item.location }</div>
            <div className="description">{ item.description }</div>
          </div>
        ))
      }
    </section>
  );
}
