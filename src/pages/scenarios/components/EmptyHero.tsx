import { emitDebugPayload } from "../debug/DebugPayloadUI";

type EmptyHeroProps = {
  onOpenScenarioBuilder: () => void;
  onBrowseTemplates: () => void;
};

export default function EmptyHero({ onOpenScenarioBuilder, onBrowseTemplates }: EmptyHeroProps) {
  return (
    <div className="py-4">
      <div className="text-center text-secondary mb-3">You haven't created any scenarios yet</div>
      <div className="card ws-card p-4">
        <div className="d-flex flex-column align-items-center text-center p-3">
          {/* Icon cluster */}
          <div className="position-relative mb-3" style={{ width: 104, height: 84 }}>
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 64, height: 64, position: "absolute", left: 20, top: 10 }}
            >
              <i className="bi bi-plus-lg" style={{ fontSize: 28 }} />
            </div>
            <div
              className="rounded-circle bg-success-subtle text-success d-flex align-items-center justify-content-center"
              style={{ width: 28, height: 28, position: "absolute", left: 62, top: 0 }}
            >
              <i className="bi bi-check2" />
            </div>
            <div
              className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36, position: "absolute", left: 70, top: 40 }}
            >
              <i className="bi bi-envelope" />
            </div>
          </div>

          <h3 className="h5 fw-semibold mb-2">Create your first Scenario</h3>
          <p className="text-secondary" style={{ maxWidth: 720 }}>
            In order to automate your tasks, you need to create a scenario. Open the builder to create your first scenario or browse our templates for an easy start.
          </p>

          <div className="d-flex gap-2 mt-1">
            <a
              href="#"
              className="btn btn-primary d-inline-flex align-items-center"
              onClick={(e) => {
                e.preventDefault();
                emitDebugPayload("scenarios.builder.open", { source: "emptyHero" });
                onOpenScenarioBuilder();
              }}
            >
              <i className="bi bi-box-arrow-up-right me-1" />
              <span>Open Scenario Builder</span>
            </a>
            <a
              href="#"
              className="btn btn-outline-dark d-inline-flex align-items-center"
              onClick={(e) => {
                e.preventDefault();
                emitDebugPayload("templates.browse.open", { source: "emptyHero" });
                onBrowseTemplates();
              }}
            >
              <i className="bi bi-grid me-1" />
              <span>Browse Templates</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
