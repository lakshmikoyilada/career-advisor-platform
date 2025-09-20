from rest_framework import serializers
from users.models.user import CustomUser

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'name', 'email', 'gender', 'phone_number', 'date_of_birth', 'hobbies',
            'highest_qualification', 'field_of_study', 'passed_out_year',
            'technical_skills', 'soft_skills', 'interests', 'experience',
            'core_work_passion', 'learning_style', 'work_environment',
            'key_strength', 'motivation_driver', 'decision_style',
            'interest_domain', 'values_lifestyle', 'created_at', 'updated_at'
        ]
        read_only_fields = ('email', 'created_at', 'updated_at')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Convert date to a more readable format if needed
        if representation.get('date_of_birth'):
            representation['date_of_birth'] = instance.date_of_birth.strftime('%Y-%m-%d')
        return representation