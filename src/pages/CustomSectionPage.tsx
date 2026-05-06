import { Navigate, useParams } from "react-router-dom";

/** Legacy URL — guide sections are accordion panels on `/custom#:slug`. */
export function CustomSectionPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <Navigate to="/custom" replace />;
  return <Navigate to={`/custom#${encodeURIComponent(slug)}`} replace />;
}
