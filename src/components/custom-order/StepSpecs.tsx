import { ArrowRight, ArrowLeft, Shirt, Layers, Printer } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { OptionCard } from "./OptionCard";
import { CUT_OPTIONS, MATERIAL_OPTIONS, PRINT_OPTIONS } from "@/src/data/customOptions";
import { useCustomOrderStore } from "@/src/store/useCustomOrderStore";

export function StepSpecs() {
  const { draft, setCut, setMaterial, setPrintMethod, nextStep, prevStep } = useCustomOrderStore();

  const specsComplete = Boolean(draft.cut && draft.material && draft.printMethod);

  return (
    <div className="space-y-10 sm:space-y-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-display font-bold text-offgrid-green mb-2">
          Garment &amp; print specs
        </h2>
        <p className="text-sm text-offgrid-green/60">
          Choose cut, fabric, and print method — everything we need to quote your run accurately.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3">
            Cut &amp; style
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CUT_OPTIONS.map((opt) => (
              <div key={opt.id}>
                <OptionCard
                  label={opt.label}
                  description={opt.description}
                  selected={draft.cut === opt.id}
                  onClick={() => setCut(opt.id)}
                  icon={Shirt}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3">
            Fabric
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MATERIAL_OPTIONS.map((opt) => (
              <div key={opt.id}>
                <OptionCard
                  label={opt.label}
                  description={opt.description}
                  selected={draft.material === opt.id}
                  onClick={() => setMaterial(opt.id)}
                  icon={Layers}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-offgrid-green/50 mb-3">
            Print method
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRINT_OPTIONS.map((opt) => (
              <div key={opt.id}>
                <OptionCard
                  label={opt.label}
                  description={opt.description}
                  selected={draft.printMethod === opt.id}
                  onClick={() => setPrintMethod(opt.id)}
                  icon={Printer}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" size="lg" className="sm:flex-1" onClick={prevStep}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <Button
          variant="default"
          size="lg"
          className="sm:flex-1 group"
          disabled={!specsComplete}
          onClick={nextStep}
        >
          Next: Review &amp; submit
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
