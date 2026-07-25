import {
  Award,
  BookOpen,
  Briefcase,
  Camera,
  Check,
  Clock,
  Edit3,
  Mail,
  Save,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";


const DEFAULT_USER = {
  name: "PathPilot User",
  email: "",
  careerGoal: "Build Your Career",
  experience: "Beginner",
  dailyTime: "1 hour",
  bio: "",
  location: "",
  profileImage: "",
  skills: [],
  interests: [],
};



const EXPERIENCE_OPTIONS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const DAILY_TIME_OPTIONS = [
  "30 minutes",
  "1 hour",
  "2 hours",
  "3+ hours",
];

function safelyParseJSON(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Unable to parse profile data:",
      error
    );

    return fallback;
  }
}

function Profile() {
  const fileInputRef = useRef(null);

  const [profile, setProfile] =
    useState(DEFAULT_USER);

  const [formData, setFormData] =
    useState(DEFAULT_USER);

  const [isEditing, setIsEditing] =
    useState(false);

  const [skillInput, setSkillInput] =
    useState("");

  const [interestInput, setInterestInput] =
    useState("");

  const [savedMessage, setSavedMessage] =
    useState(false);

  useEffect(() => {
    const storedUser = safelyParseJSON(
      localStorage.getItem("pathpilot_user"),
      DEFAULT_USER
    );

    const normalizedUser = {
      ...DEFAULT_USER,
      ...storedUser,
      skills: Array.isArray(storedUser.skills)
        ? storedUser.skills
        : [],
      interests: Array.isArray(
        storedUser.interests
      )
        ? storedUser.interests
        : [],
    };

    setProfile(normalizedUser);
    setFormData(normalizedUser);
  }, []);

  const initials = useMemo(() => {
    const words = profile.name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 0) {
      return "PP";
    }

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  }, [profile.name]);

  const profileCompletion = useMemo(() => {
    const fields = [
      profile.name,
      profile.email,
      profile.careerGoal,
      profile.experience,
      profile.dailyTime,
      profile.bio,
      profile.location,
      profile.skills.length > 0,
      profile.interests.length > 0,
    ];

    const completedFields = fields.filter(
      Boolean
    ).length;

    return Math.round(
      (completedFields / fields.length) * 100
    );
  }, [profile]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const newSkill = skillInput.trim();

    if (
      !newSkill ||
      formData.skills.some(
        (skill) =>
          skill.toLowerCase() ===
          newSkill.toLowerCase()
      )
    ) {
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      skills: [
        ...previousData.skills,
        newSkill,
      ],
    }));

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setFormData((previousData) => ({
      ...previousData,
      skills: previousData.skills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const addInterest = () => {
    const newInterest =
      interestInput.trim();

    if (
      !newInterest ||
      formData.interests.some(
        (interest) =>
          interest.toLowerCase() ===
          newInterest.toLowerCase()
      )
    ) {
      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      interests: [
        ...previousData.interests,
        newInterest,
      ],
    }));

    setInterestInput("");
  };

  const removeInterest = (
    interestToRemove
  ) => {
    setFormData((previousData) => ({
      ...previousData,
      interests:
        previousData.interests.filter(
          (interest) =>
            interest !== interestToRemove
        ),
    }));
  };
      const handleProfileImageChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    window.alert(
      "Please select a JPG, PNG, or WEBP image."
    );
    event.target.value = "";
    return;
  }

  const maximumSize = 2 * 1024 * 1024;

  if (file.size > maximumSize) {
    window.alert(
      "Profile image must be smaller than 2 MB."
    );
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    setFormData((previousData) => ({
      ...previousData,
      profileImage: String(reader.result),
    }));
  };

  reader.onerror = () => {
    window.alert(
      "Unable to read the selected image."
    );
  };

  reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const cleanedProfile = {
      ...formData,
      name:
        formData.name.trim() ||
        "PathPilot User",
      email: formData.email.trim(),
      careerGoal:
        formData.careerGoal.trim() ||
        "Build Your Career",
      bio: formData.bio.trim(),
      location:
        formData.location.trim(),
    };

    localStorage.setItem(
      "pathpilot_user",
      JSON.stringify(cleanedProfile)
    );

    setProfile(cleanedProfile);
    setFormData(cleanedProfile);
    setIsEditing(false);
    setSavedMessage(true);

    window.setTimeout(() => {
      setSavedMessage(false);
    }, 2500);
  };

  const cancelEditing = () => {
    setFormData(profile);
    setSkillInput("");
    setInterestInput("");
    setIsEditing(false);
  };

  const handleTagKeyDown = (
    event,
    callback
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      callback();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {savedMessage && (
          <div className="fixed right-5 top-24 z-50 flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl">
            <Check className="h-5 w-5" />
            Profile updated successfully
          </div>
        )}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/15 md:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/20 bg-white/15 text-3xl font-bold backdrop-blur-sm">
                      {profile.profileImage ? (
                         <img
                            src={profile.profileImage}
                            alt={`${profile.name} profile`}
                            className="h-full w-full object-cover"
                          />
                       ) : (
                         initials
                       )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                         setIsEditing(true);

                          window.setTimeout(() => {
                              fileInputRef.current?.click();
                          }, 0);
                       }}
                      className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-lg transition hover:scale-105"
                      aria-label="Change profile picture"
                    >
                     <Camera className="h-5 w-5" />
                   </button>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-indigo-100">
                  <Sparkles className="h-4 w-4" />

                  <span className="text-sm font-medium">
                    PathPilot Profile
                  </span>
                </div>

                <h1 className="text-3xl font-bold">
                  {profile.name}
                </h1>

                <p className="mt-2 text-indigo-100">
                  {profile.careerGoal}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {profile.experience}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {profile.dailyTime} daily
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsEditing(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">
                  Profile Completion
                </h2>

                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {profileCompletion}%
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Complete your profile to receive
                more personalized career guidance.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-5 font-bold">
                Career Overview
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900/30">
                    <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Career Goal
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {profile.careerGoal}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-purple-100 p-2 dark:bg-purple-900/30">
                    <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Experience Level
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {profile.experience}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 dark:bg-emerald-900/30">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Daily Commitment
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {profile.dailyTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900/30">
                  <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>

                <h2 className="text-lg font-bold">
                  About Me
                </h2>
              </div>

              {profile.bio ? (
                <p className="leading-7 text-slate-600 dark:text-slate-300">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add a short professional bio to
                  introduce yourself.
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail className="h-4 w-4" />
                    <span className="text-xs">
                      Email
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold">
                    {profile.email ||
                      "Not added yet"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-xs">
                      Location
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold">
                    {profile.location ||
                      "Not added yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />

                  <h2 className="font-bold">
                    Skills
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.skills.length > 0 ? (
                    profile.skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                        >
                          {skill}
                        </span>
                      )
                    )
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />

                  <h2 className="font-bold">
                    Interests
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.interests.length >
                  0 ? (
                    profile.interests.map(
                      (interest) => (
                        <span
                          key={interest}
                          className="rounded-xl bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                        >
                          {interest}
                        </span>
                      )
                    )
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No interests added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <h2 className="text-xl font-bold">
                    Edit Profile
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Update your personal and career
                    information.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6 p-6">
                    <div>
                        <span className="mb-3 block text-sm font-semibold">
                          Profile Picture
                        </span>

                       <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                         <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                             {formData.profileImage ? (
                                 <img
                                       src={formData.profileImage}
                                       alt="Profile preview"
                                        className="h-full w-full object-cover"
                                    />
                              ) : (
                                 initials
                               )}
                         </div>

                         <div className="flex flex-wrap gap-3">
                               <button
                                 type="button"
                                 onClick={() =>
                                 fileInputRef.current?.click()
                                 }
                                 className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                   <Camera className="h-4 w-4" />
                                    Upload Photo
                                </button>

                                {formData.profileImage && (
                                 <button
                                     type="button"
                                      onClick={() =>
                                     setFormData(
                                     (previousData) => ({
                                       ...previousData,
                                       profileImage: "",
                                     })
                                     )
                                     }
                                     className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                   >
                                     Remove Photo
                                  </button>
                               )}
                           </div>
                       </div>

                      <input
                         ref={fileInputRef}
                         type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleProfileImageChange}
                           className="hidden"
                        />

                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        JPG, PNG, or WEBP. Maximum size: 2 MB.
                        </p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-semibold">
                      Full Name
                    </span>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={
                        handleInputChange
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-semibold">
                      Email Address
                    </span>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={
                        handleInputChange
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                    />
                  </label>
                </div>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Career Goal
                  </span>

                  <input
                    type="text"
                    name="careerGoal"
                    value={
                      formData.careerGoal
                    }
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-semibold">
                      Experience Level
                    </span>

                    <select
                      name="experience"
                      value={
                        formData.experience
                      }
                      onChange={
                        handleInputChange
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                    >
                      {EXPERIENCE_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-semibold">
                      Daily Learning Time
                    </span>

                    <select
                      name="dailyTime"
                      value={
                        formData.dailyTime
                      }
                      onChange={
                        handleInputChange
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                    >
                      {DAILY_TIME_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Location
                  </span>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Islamabad, Pakistan"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold">
                    Professional Bio
                  </span>

                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={300}
                    placeholder="Tell us about your skills, experience, and career goals..."
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                  />

                  <span className="mt-1 block text-right text-xs text-slate-500">
                    {formData.bio.length}/300
                  </span>
                </label>

                <div>
                  <span className="mb-2 block text-sm font-semibold">
                    Skills
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(event) =>
                        setSkillInput(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleTagKeyDown(
                          event,
                          addSkill
                        )
                      }
                      placeholder="Add a skill"
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                    />

                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-xl bg-indigo-600 px-5 font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.skills.map(
                      (skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                        >
                          {skill}

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(
                                skill
                              )
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-sm font-semibold">
                    Interests
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={interestInput}
                      onChange={(event) =>
                        setInterestInput(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleTagKeyDown(
                          event,
                          addInterest
                        )
                      }
                      placeholder="Add an interest"
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-950"
                    />

                    <button
                      type="button"
                      onClick={addInterest}
                      className="rounded-xl bg-purple-600 px-5 font-semibold text-white transition hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.interests.map(
                      (interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                        >
                          {interest}

                          <button
                            type="button"
                            onClick={() =>
                              removeInterest(
                                interest
                              )
                            }
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;