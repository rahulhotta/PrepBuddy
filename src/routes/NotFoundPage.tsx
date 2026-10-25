import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="th">
      <span className="tag2">404</span>
      <h1>Sheet not found</h1>
      <p>
        That drawing is not in the index. <Link to="/">Back to the index</Link>.
      </p>
    </div>
  );
}
