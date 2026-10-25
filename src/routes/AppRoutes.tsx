import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";

const HomePage = lazy(() => import("./HomePage"));
const TopicPage = lazy(() => import("./TopicPage"));
const SubjectPage = lazy(() => import("./SubjectPage"));
const NotFoundPage = lazy(() => import("./NotFoundPage"));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path=":topicId" element={<TopicPage />} />
        <Route path=":topicId/:subjectId" element={<SubjectPage />} />
        <Route path=":topicId/:subjectId/:material" element={<SubjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
