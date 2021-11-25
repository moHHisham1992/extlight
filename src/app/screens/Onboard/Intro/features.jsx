export default function Features({ features }) {
  return (
    <div className="space-y-10 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10">
      {features.map((feature) => (
        <div key={feature.name}>
          <dt>
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-bitcoin text-white">
              <feature.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-5 text-lg leading-6 font-medium text-gray-900">
              {feature.name}
            </p>
          </dt>
          <dd className="mt-2 text-gray-500">{feature.description}</dd>
        </div>
      ))}
    </div>
  );
}
