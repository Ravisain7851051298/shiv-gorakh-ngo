"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import getUserFacingError from "@/lib/getUserFacingError";
import { registerVolunteer, updateVolunteer } from "@/store/volunteerSlice";

const animalTypeOptions = ["DOG", "CAT", "COW", "BIRD", "HORSE", "OTHER"];
const skillOptions = [
  "ANIMAL_RESCUE",
  "ANIMAL_FIRST_AID",
  "ANIMAL_CARE",
  "DRIVING",
  "PHOTOGRAPHY",
  "SOCIAL_MEDIA",
  "FUNDRAISING",
  "EVENT_MANAGEMENT",
  "OTHER",
];
const dayOptions = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const activityOptions = [
  "RESCUE",
  "FEEDING",
  "SHELTER_SUPPORT",
  "ADOPTION",
  "MEDICAL_SUPPORT",
  "AWARENESS",
  "FUNDRAISING",
  "OTHER",
];

const emptyValues = {
  address: { state: "", city: "", pincode: "", addressLine: "" },
  animalTypes: [],
  skills: [],
  experience: "",
  availability: { days: [], emergencyAvailable: false },
  rescueCapabilities: {
    canRescue: false,
    canTransport: false,
    vehicleType: "CAR",
    canHandleInjuredAnimals: false,
  },
  preferredActivities: [],
  emergencyContact: { name: "", relationship: "", phone: "" },
  status: "ACTIVE",
};

function getInitialValues(profile) {
  return {
    ...emptyValues,
    ...profile,
    animalTypes: profile?.animalTypes ?? emptyValues.animalTypes,
    skills: profile?.skills ?? emptyValues.skills,
    preferredActivities:
      profile?.preferredActivities ?? emptyValues.preferredActivities,
    address: { ...emptyValues.address, ...profile?.address },
    availability: { ...emptyValues.availability, ...profile?.availability },
    rescueCapabilities: {
      ...emptyValues.rescueCapabilities,
      ...profile?.rescueCapabilities,
    },
    emergencyContact: {
      ...emptyValues.emergencyContact,
      ...profile?.emergencyContact,
    },
  };
}

const inputClassName =
  "mt-2 w-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15";

function CheckboxGroup({ legend, name, options, selected, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-stone-800">{legend}</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label
            className="flex items-center gap-2 text-sm text-stone-700"
            key={option}
          >
            <input
              className="size-4 accent-brand-orange"
              type="checkbox"
              name={name}
              value={option}
              checked={selected.includes(option)}
              onChange={onChange}
            />
            {option.replaceAll("_", " ").toLowerCase()}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function VolunteerRegistrationForm({
  initialProfile,
  onSuccess,
  onCancel,
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, initialized } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.volunteer);
  const isEditing = Boolean(initialProfile);
  const [values, setValues] = useState(() => getInitialValues(initialProfile));

  useEffect(() => {
    if (initialized && !user) {
      router.replace("/register?redirect=%2Fvolunteer%2Fregister");
    }
  }, [initialized, router, user]);

  function updateValue(event) {
    const { name, value, type, checked } = event.target;
    const [group, field] = name.split(".");
    const nextValue = type === "checkbox" ? checked : value;
    setValues((current) => {
      if (group === "status") return { ...current, status: nextValue };
      return {
        ...current,
        [group]: { ...current[group], [field]: nextValue },
      };
    });
  }

  function updateList(event) {
    const { name, value, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: name.includes(".")
        ? {
          ...current[name.split(".")[0]],
          [name.split(".")[1]]: checked
            ? [...current[name.split(".")[0]][name.split(".")[1]], value]
            : current[name.split(".")[0]][name.split(".")[1]].filter(
              (item) => item !== value,
            ),
        }
        : checked
          ? [...current[name], value]
          : current[name].filter((item) => item !== value),
    }));
  }

  async function submitVolunteer(event) {
    event.preventDefault();
    const validationMessage = validateSelections();
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    const payload = volunteerPayload();
    const result = await dispatch(
      isEditing
        ? updateVolunteer({ ...payload, status: values.status })
        : registerVolunteer(payload),
    );

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(
        isEditing
          ? "Your volunteer profile has been updated."
          : "Your volunteer profile has been registered.",
      );
      if (onSuccess) onSuccess(result.payload);
      else router.replace("/profile");
    } else {
      toast.error(
        getUserFacingError(
          result.payload,
          "Unable to complete the volunteer request.",
        ),
      );
    }
  }

  function volunteerPayload() {
    return {
      address: values.address,
      animalTypes: values.animalTypes,
      skills: values.skills,
      experience: values.experience,
      availability: values.availability,
      rescueCapabilities: values.rescueCapabilities,
      preferredActivities: values.preferredActivities,
      emergencyContact: values.emergencyContact,
    };
  }

  function validateSelections() {
    if (!values.animalTypes.length) return "Select at least one animal type.";
    if (!values.skills.length) return "Select at least one skill.";
    if (!values.availability.days.length)
      return "Select at least one available day.";
    if (!values.preferredActivities.length)
      return "Select at least one preferred activity.";
    return "";
  }

  if (!initialized || !user) {
    return (
      <p className="text-sm text-stone-600" role="status">
        {initialized
          ? "Taking you to account registration..."
          : "Checking your sign-in..."}
      </p>
    );
  }

  return (
    <form className="space-y-8" onSubmit={submitVolunteer}>
      <p className="text-sm leading-6 text-stone-600">
        {isEditing
          ? "Update your volunteer details or remove your volunteer profile."
          : "Complete your volunteer profile. You can update or remove it later."}
      </p>

      <section className="space-y-4" aria-labelledby="address-heading">
        <h3 className="font-serif text-2xl text-stone-900" id="address-heading">
          Your address
        </h3>
        <label className="block text-sm font-semibold text-stone-800">
          Address
          <input
            className={inputClassName}
            name="address.addressLine"
            value={values.address.addressLine}
            onChange={updateValue}
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["City", "city"],
            ["State", "state"],
            ["Pincode", "pincode"],
          ].map(([label, field]) => (
            <label
              className="block text-sm font-semibold text-stone-800"
              key={field}
            >
              {label}
              <input
                className={inputClassName}
                name={`address.${field}`}
                value={values.address[field]}
                onChange={updateValue}
                required
              />
            </label>
          ))}
        </div>
      </section>

      <CheckboxGroup
        legend="Which animals can you help?"
        name="animalTypes"
        options={animalTypeOptions}
        selected={values.animalTypes}
        onChange={updateList}
      />
      <CheckboxGroup
        legend="Your skills"
        name="skills"
        options={skillOptions}
        selected={values.skills}
        onChange={updateList}
      />

      <label className="block text-sm font-semibold text-stone-800">
        Relevant experience
        <textarea
          className={`${inputClassName} min-h-24 resize-y`}
          name="experience"
          rows={3}
          value={values.experience}
          onChange={(event) => {
            setValues((current) => ({
              ...current,
              experience: event.target.value,
            }));
          }}
          placeholder="Tell us about your volunteering or animal-care experience."
        />
      </label>

      <CheckboxGroup
        legend="Days you are usually available"
        name="availability.days"
        options={dayOptions}
        selected={values.availability.days}
        onChange={(event) => {
          const { value, checked } = event.target;
          setValues((current) => ({
            ...current,
            availability: {
              ...current.availability,
              days: checked
                ? [...current.availability.days, value]
                : current.availability.days.filter((day) => day !== value),
            },
          }));
        }}
      />

      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-stone-900">
          Rescue capabilities
        </h3>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            className="size-4 accent-brand-orange"
            type="checkbox"
            name="availability.emergencyAvailable"
            checked={values.availability.emergencyAvailable}
            onChange={updateValue}
          />
          Available for emergencies
        </label>
        {[
          ["Can assist with rescues", "canRescue"],
          ["Can transport animals", "canTransport"],
          ["Can handle injured animals", "canHandleInjuredAnimals"],
        ].map(([label, field]) => (
          <label
            className="flex items-center gap-2 text-sm text-stone-700"
            key={field}
          >
            <input
              className="size-4 accent-brand-orange"
              type="checkbox"
              name={`rescueCapabilities.${field}`}
              checked={values.rescueCapabilities[field]}
              onChange={updateValue}
            />
            {label}
          </label>
        ))}
        <label className="block text-sm font-semibold text-stone-800">
          Vehicle type
          <select
            className={inputClassName}
            name="rescueCapabilities.vehicleType"
            value={values.rescueCapabilities.vehicleType || "BIKE"}
            onChange={updateValue}
          >
            <option value="BIKE">Bike / Two-Wheeler</option>
            <option value="CAR">Car</option>
            <option value="VAN">Van / Animal Ambulance</option>
            <option value="TRUCK">Truck / Heavy Vehicle</option>
            <option value="OTHER">Other Vehicle</option>
          </select>
        </label>
      </section>

      <CheckboxGroup
        legend="Activities you prefer"
        name="preferredActivities"
        options={activityOptions}
        selected={values.preferredActivities}
        onChange={updateList}
      />

      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-stone-900">
          Emergency contact
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Name", "name"],
            ["Relationship", "relationship"],
            ["Phone", "phone"],
          ].map(([label, field]) => (
            <label
              className="block text-sm font-semibold text-stone-800"
              key={field}
            >
              {label}
              <input
                className={inputClassName}
                name={`emergencyContact.${field}`}
                type={field === "phone" ? "tel" : "text"}
                value={values.emergencyContact[field]}
                onChange={updateValue}
                required
              />
            </label>
          ))}
        </div>
      </section>

      {isEditing && (
        <label className="block text-sm font-semibold text-stone-800">
          Profile status
          <select
            className={inputClassName}
            name="status.status"
            value={values.status}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                status: event.target.value,
              }));
            }}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="min-h-12 flex-1 bg-brand-orange px-6 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Please wait..."
            : isEditing
              ? "Save volunteer profile"
              : "Register as a volunteer"}
        </button>
        {onCancel ? (
          <button
            className="min-h-12 border border-brand-orange px-6 text-sm font-bold text-brand-orange transition hover:bg-orange-50"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        ) : null}
      </div>
      <p className="text-center text-xs text-stone-500">
        Signed in as {user.email}.{" "}
        <Link className="font-semibold text-brand-orange" href="/profile">
          View your account
        </Link>
      </p>
    </form>
  );
}
